// import { Schema, model } from 'mongoose';

import { Model } from 'mongoose';

// Created User Modal-Schema property inferface
export type IUser = {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | string;
  interests: string[];
};
// user Longin Token Interface
export type IUserLogin = {
  access_token?: string;
  refresh_token?: string;
};

//get searching all user
export type ISearchUser = {
  name?: string;
  email?: string;
  id?: string;
};
// update a user ruler
export type IupdateRuler = {
  ruler: string;
};

// Create a new Model type that knows about IUserMethods...
export type UserModel = Model<IUser, Record<string, unknown>>;
