/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiError } from '../../../errors/ApiError';
import { IPost, PostDocument } from './post.interface';

import { PostsModel } from './post.model';

// Create a Post business logic
const createPost = async (post: IPost): Promise<PostDocument | null> => {
  const postToCreate = post;

  const created = await PostsModel.create(postToCreate);

  if (!created) {
    throw new ApiError(500, 'Post creation failed', '');
  }

  return created as PostDocument;
};

export const PostServices = {
  createPost,
};
