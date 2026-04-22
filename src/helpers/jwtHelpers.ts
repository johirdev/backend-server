import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const createToken = (
  payload: object,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, { expiresIn: expireTime } as SignOptions);
};
//create forgotpass
const createForgotPasswordToken = (
  payload: object,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: expireTime,
  } as SignOptions);
};

const verifiedToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret);
};

export const jwtHelpers = {
  createToken,
  verifiedToken,
  createForgotPasswordToken,
};
