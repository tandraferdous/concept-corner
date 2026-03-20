import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-${timestamp}-${random}`;
};

export const generateToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('hex');

export const generateUUID = (): string => uuidv4();

const ALGORITHM = 'aes-256-cbc';

const getEncryptionKey = (): Buffer => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return crypto.scryptSync(secret, 'concept-corner-encrypt-salt', 32);
};

export const encrypt = (text: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (encryptedText: string): string => {
  const key = getEncryptionKey();
  const [ivHex, encryptedHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};
