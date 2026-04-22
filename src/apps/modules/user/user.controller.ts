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

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    data: result,
    message: 'User Create successfully',
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const loginData = req.body;

  const result = await UserServices.userLogin(loginData);

  const { refresh_token, ...others } = result;

  // 🍪 Cookie options
  const cookiesOption = {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  };
  // Set refresh token in cookie
  res.cookie('refresh_token', refresh_token, cookiesOption);

  sendResponse<IUserLogin>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: others,
    message: 'User login successful',
  });
});

const AllUser = catchAsync(async (req: Request, res: Response) => {
  const filtering = queryPick(req.query, ['searchTerm', 'name']);

  // pagination option property field
  const pagintionField = ['page', 'limit', 'sortBy', 'sortOrder'];

  // querypick is costom funtcion
  const paginationOption = queryPick(req.query, pagintionField);

  const result = await UserServices.getAllUser(filtering, paginationOption);

  sendResponse<ISearchUser[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    meta: result?.meta,
    data: result?.data,
    message: 'searching users successfully',
  });
});

export const updateSingleUser = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = req.body;

    const result = await UserServices.updateUser(id, userData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: 'User updated successfully',
    });
  }
);
export const updateUserProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = req.body;

    const result = await UserServices.updateUserProfile(id, userData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: 'User updated successfully',
    });
  }
);

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await UserServices.deleteSingelUser(id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'user deleted successfully',
  });
});

const groupByInterests = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.groupUsersByInterests();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: 'Users grouped by interests',
  });
});

const getUserPosts = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getUserPosts(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: 'User posts retrieved',
  });
});

// exported there CreateUserController
export const UserController = {
  userCreate,
  login,
  AllUser,
  groupByInterests,
  getUserPosts,
  updateSingleUser,
  updateUserProfile,
  deleteUser,
};
