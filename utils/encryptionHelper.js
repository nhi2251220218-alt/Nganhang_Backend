const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

const SECRET_KEY = process.env.ENCRYPTION_KEY;
if (!SECRET_KEY || SECRET_KEY.length !== 32) {
  throw new Error(`ENCRYPTION_KEY phải đúng 32 ký tự, hiện tại: ${SECRET_KEY?.length ?? 'undefined'}`);
}

// Mã hóa số tài khoản
const encryptAccount = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'utf8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Giải mã số tài khoản
const decryptAccount = (text) => {
  if (!text || !text.includes(':')) return null;
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'utf8'), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Hash STK để tìm kiếm (không thể giải mã)
const hashAccountForSearch = (text) => {
  return crypto.createHmac('sha256', SECRET_KEY).update(text).digest('hex');
};

// Che STK: 0123456789 → ******6789
const maskAccount = (text) => {
  if (!text) return '******';
  return '******' + text.slice(-4);
};

module.exports = {
  encryptAccount,
  decryptAccount,
  hashAccountForSearch,
  maskAccount,
};