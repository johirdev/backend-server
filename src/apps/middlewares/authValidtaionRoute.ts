import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { Admin } from '../modules/admin/admin.model';

export const atuthValidationRoute =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req?.headers?.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - Token missing',
        });
      }
      const token = authHeader.split(' ')[1].replace(/^"|"$/g, '');
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - Token not found',
        });
      }
      if (!config.jwt.secret) {
        throw new Error('JWT secret is not defined in config');
      }

      let decoded: jwt.JwtPayload;
      try {
        decoded = jwt.verify(
          token,
          config.jwt.secret as string
        ) as jwt.JwtPayload;
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          return res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized - Token expired',
          });
        }
        if (error.name === 'JsonWebTokenError') {
          return res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized - Invalid token',
          });
        }
        throw error;
      }

      const { email, id, iat, exp } = decoded;
      if (!email || !id) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - Invalid token payload',
        });
      }

      const isUserExist = await Admin.findOne({
        _id: id,
        email,
        authToken: token,
      });

      if (!isUserExist) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - Admin not found',
        });
      }
      if (!isUserExist.authToken) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - Admin token not found',
        });
      }

      let dbTokenPayload: jwt.JwtPayload;
      try {
        dbTokenPayload = jwt.verify(
          isUserExist.authToken,
          config.jwt.secret as string
        ) as jwt.JwtPayload;
      } catch {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - Invalid stored token',
        });
      }

      if (iat !== dbTokenPayload.iat || exp !== dbTokenPayload.exp) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized - Token time mismatch',
        });
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
