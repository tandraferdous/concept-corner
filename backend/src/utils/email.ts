import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async (options: MailOptions): Promise<void> => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME ?? 'Concept Corner'}" <${process.env.FROM_EMAIL}>`,
    ...options,
  });
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendMail({
    to: email,
    subject: 'Verify your Concept Corner account',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for registering at Concept Corner. Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: 'Reset your Concept Corner password',
    html: `
      <h2>Hello ${name},</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>This link expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
  await sendMail({
    to: email,
    subject: 'Welcome to Concept Corner!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your email has been verified. You can now browse and enroll in courses.</p>
      <a href="${process.env.FRONTEND_URL}/courses" style="display:inline-block;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;">Browse Courses</a>
    `,
  });
};

export const sendEnrollmentEmail = async (
  email: string,
  name: string,
  courseTitle: string
): Promise<void> => {
  await sendMail({
    to: email,
    subject: `You're enrolled in ${courseTitle}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Congratulations! You have successfully enrolled in <strong>${courseTitle}</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/my-courses" style="display:inline-block;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;">Go to My Courses</a>
      <p>Happy learning!</p>
    `,
  });
};
