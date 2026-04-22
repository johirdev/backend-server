/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { ApiError } from '../../../errors/ApiError';
import { ISearchUser, IUser } from './user.interface';
import { UsersModel } from './user.model';
import bcrypt from 'bcrypt';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

import { IPaginationOpton } from '../../../interfaces/pagination';
import { IGenaricRespons } from '../../../interfaces/common';
import { userSearchableFields } from './user.constant';
import { HelperPagination } from '../../../helpers/paginationHelper';
import { SortOrder } from 'mongoose';

// -----> create A User business logic ------->
const createdUser = async (user: IUser): Promise<IUser | null> => {
  const { name, email, password, role, interests } = user;

  const sanitizedEmail = email?.trim().toLowerCase();

  // Check existing user
  if (sanitizedEmail) {
    const existingUser = await UsersModel.findOne({ email: sanitizedEmail });

    if (existingUser) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'User already exists with this email.',
        ''
      );
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round)
  );

  const userToCreate = {
    name,
    email: sanitizedEmail,
    role: role || 'user',
    interests: Array.isArray(interests)
      ? interests
      : interests
      ? [interests]
      : [],
    password: hashedPassword,
  };

  const created = await UsersModel.create(userToCreate);

  if (!created) {
    throw new ApiError(500, 'User creation failed', '');
  }

  return created;
};

const userLogin = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  // 1️⃣ Check required fields
  if (!email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Email and password are required',
      ''
    );
  }

  // 2️⃣ Find user (IMPORTANT: include password)
  const user = await UsersModel.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User not found with this email',
      ''
    );
  }

  // 3️⃣ Compare password
  const isPasswordMatch = await bcrypt.compare(
    password,
    user.password as string
  );

  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password', '');
  }

  // 4️⃣ Create Access Token
  const access_token = jwtHelpers.createToken(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      interests: user.interests || [],
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  // 5️⃣ Create Refresh Token
  const refresh_token = jwtHelpers.createToken(
    { id: user._id },
    config.jwt.secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  // 6️⃣ Return tokens
  return {
    access_token,
    refresh_token,
  };
};

const getAllUsers = async (
  filtering: Record<string, any>,
  paginationOption: IPaginationOpton
): Promise<IGenaricRespons<ISearchUser[]> | null> => {
  const { searchTerm, start_date, end_date, ...filtersData } = filtering;

  // Ensure searchTerm is a string
  const searchTermString = typeof searchTerm === 'string' ? searchTerm : '';

  // Build the query conditions for the database
  const andConditions: Record<string, any>[] = [];

  // Add search condition
  if (searchTermString) {
    andConditions.push({
      $or: userSearchableFields?.map(field => ({
        [field]: {
          $regex: searchTermString,
          $options: 'i',
        },
      })),
    });
  }

  // ✅ Date range filter
  if (start_date || end_date) {
    const dateFilter: Record<string, any> = {};
    if (start_date) {
      const startDateObj = new Date(start_date);
      // যদি invalid date হয় তাহলে skip করবে
      if (!isNaN(startDateObj.getTime())) {
        dateFilter.$gte = startDateObj;
      }
    }

    if (end_date) {
      const endDateObj = new Date(end_date);
      if (!isNaN(endDateObj.getTime())) {
        // শেষ দিনের 23:59:59 পর্যন্ত include করা
        endDateObj.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDateObj;
      }
    }

    // ✅ কেবল valid date থাকলে condition push করবে
    if (Object.keys(dateFilter).length > 0) {
      andConditions.push({ createdAt: dateFilter });
    }
  }

  // ✅ Other filters (except empty/null)
  const validFilters = Object.entries(filtersData).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );

  // Add filtering conditions

  if (validFilters.length) {
    andConditions.push({
      $and: validFilters.map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Destructure pagination options
  const { page, limit, skip, sortBy, sortOrder } =
    HelperPagination.calculationPagination(paginationOption);

  // Define sort conditions
  const sortConditions: Record<string, SortOrder> = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  // Combine all conditions
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // Fetch the data from MongoDB
  const result = await UsersModel.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  // ❗ Filtered total count
  const total = await UsersModel.countDocuments(whereConditions);

  // Return the response with metadata and data
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const updateUser = async (
  id: string,
  user: Partial<IUser>
): Promise<IUser | null> => {
  const existingUser = await UsersModel.findById(id);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  // hash password if provided
  if (user.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_round)
    );
  }

  // allowed fields based on schema
  const allowedFields: (keyof IUser)[] = ['name', 'email', 'password', 'role'];

  const updateData: Partial<IUser> = {};

  allowedFields.forEach(field => {
    const value = user[field];
    if (value !== undefined && value !== null) {
      updateData[field] = value as any;
    }
  });

  const updatedUser = await UsersModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User update failed', '');
  }

  return updatedUser;
};

export const updateUserProfile = async (
  id: string,
  user: Partial<IUser>
): Promise<IUser | null> => {
  const existingUser = await UsersModel.findById(id);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  // hash password if provided
  if (user.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_round)
    );
  }

  // allowed fields based on schema
  const allowedFields: (keyof IUser)[] = ['name', 'email', 'password'];

  const updateData: Partial<IUser> = {};

  allowedFields.forEach(field => {
    const value = user[field];
    if (value !== undefined && value !== null) {
      updateData[field] = value as any;
    }
  });

  const updatedUser = await UsersModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User update failed', '');
  }

  return updatedUser;
};

const deleteSingelUser = async (id: string): Promise<void> => {
  const users = await UsersModel.findById(id);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found', '');
  }

  await UsersModel.findByIdAndDelete(id);
};

export const UserServices = {
  createdUser,
  userLogin,
  getAllUsers,
  updateUser,
  updateUserProfile,
  deleteSingelUser,
};
