import { Schema, model } from 'mongoose';
import { PostDocument, PostModel } from './post.interface';

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes to support list/read operations and aggregation
postSchema.index({ user: 1 });
postSchema.index({ createdAt: -1 });

export const PostsModel = model<PostDocument, PostModel>(
  'Posts',
  postSchema,
  'posts'
);
