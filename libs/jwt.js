import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;

export function signJWT(payload, expiresIn = '30d') {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}