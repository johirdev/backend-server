import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../../config';
import { ApiError } from '../../errors/ApiError';
import { UsersModel } from '../modules/user/user.model';

type DecodedToken = JwtPayload & {
  id: string;
  email: string;
  role: string;
};

export const TokenRoleAccess =
  (allowedRoles: string[] = []) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Check token
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'Access denied. Please login first.',
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
          'Session expired. Please login again.',
          ''
        );
      }

      // 3. Get user
      const user = await UsersModel.findById(decoded.id).select(
        '_id email role'
      );

      if (!user) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'User not found. Please login again.',
          ''
        );
      }

      // 4. Optional role check (admin/user control)
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to access this resource.',
          ''
        );
      }

      // 5. Attach user
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
