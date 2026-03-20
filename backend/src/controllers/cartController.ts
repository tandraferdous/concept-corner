import { Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import Course from '../models/Course';
import { AppError } from '../middleware/error';
import { AuthRequest } from '../middleware/auth';

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id }).populate(
      'items.course',
      'title thumbnail price discountedPrice instructor slug rating'
    );

    res.status(200).json({ success: true, data: cart ?? { user: req.user!.id, items: [] } });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return next(new AppError('Course not found', 404));
    }

    let cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user!.id,
        items: [{ course: courseId, addedAt: new Date() }],
      });
    } else {
      const alreadyInCart = cart.items.some(
        (item) => String(item.course) === courseId
      );
      if (alreadyInCart) {
        return next(new AppError('Course already in cart', 409));
      }
      cart.items.push({ course: course._id as typeof course._id, addedAt: new Date() });
      await cart.save();
    }

    await cart.populate('items.course', 'title thumbnail price discountedPrice slug');

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => String(item.course) !== req.params.courseId
    );

    if (cart.items.length === initialLength) {
      return next(new AppError('Course not found in cart', 404));
    }

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Cart.findOneAndUpdate({ user: req.user!.id }, { items: [] });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
