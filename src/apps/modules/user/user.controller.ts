import { Request, Response } from 'express';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { UserServices } from './user.service';
import { ISearchUser, IUserLogin } from './user.interface';
import config from '../../../config';
import { queryPick } from '../../../shared/queryPick';

const userCreate = catchAsync(async (req: Request, res: Response) => {
  const user = req.body;
  const result = await UserServices.createdUser(user);
  // Formating result returen value
  if (result !== null) {
    const { refreshToken, ...others } = result;

    // Set refresh token in cookies
    const cookiesOption = {
      secure: config.evn === 'production',
      httpOnly: true,
    };

    res.cookie('refreshToken', refreshToken, cookiesOption);

    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: others,
      message: 'Registration Successfully',
    });
  } else {
    // Handle the case where login is unsuccessful
    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'Registration failed. Invalid credentials.',
    });
  }
});

const AllUser = catchAsync(async (req: Request, res: Response) => {
  const filtering = queryPick(req.query, ['name', 'email']);

  // pagination option property field
  const pagintionField = ['page', 'limit', 'sortBy', 'sortOrder'];

  // querypick is costom funtcion
  const paginationOption = queryPick(req.query, pagintionField);

  const result = await UserServices.getAllUsers(filtering, paginationOption);

  sendResponse<ISearchUser[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    meta: result?.meta,
    data: result?.data,
    message: 'searching users successfully',
  });
});

// exported there CreateUserController | Or imported there user.routes.ts file |
export const UserController = {
  userCreate,
  AllUser,
};
