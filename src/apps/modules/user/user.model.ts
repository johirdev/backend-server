import { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';
// import bcrypt from 'bcrypt';
// import config from '../../../config';

// ## This is User Schema Model document interface.

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    interests: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ interests: 1 });

// ## this MongoDb collection file name therer create save user data
export const UsersModel = model<IUser, UserModel>('Users', userSchema, 'users');
