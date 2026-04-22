import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../../config';
import { ApiError } from '../../errors/ApiError';
import { UsersModel } from '../modules/user/user.model';

type DecodedToken = JwtPayload & {
  id: string;
  role: string;
};

export const AdminTokenValidation =
  (roles: string[] = []) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Authorization header check
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'Access denied. Please log in to your account to continue.',
          ''
        );
      }

      const token = authHeader.split(' ')[1];

      // 2. Verify token
      let decoded: DecodedToken;
      try {
        decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
      } catch {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'Your session has expired. Please log in again.',
          ''
        );
      }

      // 3. Find user
      const user = await UsersModel.findById(decoded.id).select(
        '_id role email'
      );

      if (!user) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Account not found. Please log in again.',
          ''
        );
      }

      // 4. Role check
      if (roles.length && !roles.includes(user.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action.',
          ''
        );
      }

      // 5. Attach user
      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
