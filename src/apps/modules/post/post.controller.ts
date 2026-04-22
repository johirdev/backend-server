import { Request, Response } from 'express';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PostServices } from './post.service';
import { queryPick } from '../../../shared/queryPick';

const postCreate = catchAsync(async (req: Request, res: Response) => {
  const post = req.body;

  const result = await PostServices.createPost(post);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    data: result,
    message: 'Post created successfully',
  });
});

const AllPost = catchAsync(async (req: Request, res: Response) => {
  // include searchTerm properly
  const filtering = queryPick(req.query, ['searchTerm', 'title']);

  // pagination fields
  const pagintionField = ['page', 'limit', 'sortBy', 'sortOrder'];

  const paginationOption = queryPick(req.query, pagintionField);

  const result = await PostServices.getAllPost(filtering, paginationOption);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    meta: result?.meta,
    data: result?.data,
    message: 'searching post successfully',
  });
});

export const updateSinglePost = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = req.body;

    const result = await PostServices.updatePost(id, userData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: 'post updated successfully',
    });
  }
);

export const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await PostServices.deleteSingelPost(id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'post deleted successfully',
  });
});

export const PostController = {
  postCreate,
  AllPost,
  deletePost,
  updateSinglePost,
};
