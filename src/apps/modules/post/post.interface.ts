import { Document, Model, Types } from 'mongoose';

// Post document interface
export type IPost = {
  title: string;
  content: string;
  user: Types.ObjectId | string; // ObjectId reference to Users collection
};
//get searching all user
export type ISearchUser = {
  title?: string;
  content?: string;
};
export const userSearchableFields = ['title'];


// Post mongoose document and model types
export type PostDocument = Document & IPost;
export type PostModel = Model<PostDocument>;
