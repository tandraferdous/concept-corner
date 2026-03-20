import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../utils/email';
import { generateToken } from '../utils/helpers';

const sendTokenResponse = async (
  res: Response,
  userId: string,
  email: string,
  role: string,
  statusCode = 200
): Promise<void> => {
  const accessToken = generateAccessToken({ id: userId, email, role });
  const refreshToken = generateRefreshToken({ id: userId, email, role });

  await User.findByIdAndUpdate(userId, { refreshToken });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 409));
    }

    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'instructor' ? 'instructor' : 'student',
      emailVerificationToken: crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex'),
      emailVerificationExpires: verificationExpires,
    });

    await sendVerificationEmail(email, name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      '+password +loginAttempts +lockUntil +refreshToken'
    );

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.isLocked()) {
      return next(
        new AppError('Account temporarily locked due to too many failed attempts', 423)
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isEmailVerified) {
      return next(new AppError('Please verify your email before logging in', 403));
    }

    await user.resetLoginAttempts();
    await sendTokenResponse(res, String(user._id), user.email, user.role);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: '' } });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('No account found with that email', 404));
    }

    const resetToken = generateToken();
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return next(new AppError('Refresh token required', 400));
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Refresh token is no longer valid', 401));
    }

    await sendTokenResponse(res, String(user._id), user.email, user.role);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).populate(
      'enrolledCourses.course',
      'title thumbnail'
    );
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    const { currentPassword, newPassword } = req.body;
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
