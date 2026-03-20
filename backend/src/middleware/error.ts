import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
  errors?: Record<string, { message: string }>;
}

const handleCastError = (err: MongoError): AppError =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err: MongoError): AppError => {
  const field = Object.keys(err.keyValue ?? {})[0];
  return new AppError(
    `Duplicate value for field: ${field}. Please use a different value.`,
    409
  );
};

const handleValidationError = (err: MongoError): AppError => {
  const messages = Object.values(err.errors ?? {})
    .map((e) => e.message)
    .join('. ');
  return new AppError(`Validation error: ${messages}`, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired. Please log in again.', 401);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (
  err: Error & { statusCode?: number; code?: number; name?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: AppError =
    err instanceof AppError
      ? err
      : new AppError(err.message || 'Internal server error', err.statusCode ?? 500);

  if (err.name === 'CastError') error = handleCastError(err as MongoError);
  if (err.code === 11000) error = handleDuplicateKeyError(err as MongoError);
  if (err.name === 'ValidationError')
    error = handleValidationError(err as MongoError);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const isDev = process.env.NODE_ENV === 'development';

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(isDev && { stack: err.stack }),
  });
};

export default errorHandler;
