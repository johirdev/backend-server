import { Request, Response } from 'express';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PostServices } from './post.service';

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

export const PostController = {
  postCreate,
};
