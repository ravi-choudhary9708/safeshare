import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; 
const IV_LENGTH = 12;  
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

export async function encryptBuffer(buffer, otp) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  const key = await new Promise((resolve, reject) => {
    crypto.pbkdf2(otp, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encryptedBuffer: Buffer.concat([encrypted, tag]),
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
  };
}

export async function decryptBuffer(encryptedWithTag, otp, ivBase64, saltBase64) {
  const salt = Buffer.from(saltBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = encryptedWithTag.slice(-TAG_LENGTH);
  const encrypted = encryptedWithTag.slice(0, -TAG_LENGTH);

  const key = await new Promise((resolve, reject) => {
    crypto.pbkdf2(otp, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted;
}