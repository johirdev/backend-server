import { z } from 'zod';

// create a User zod validation
const createUserZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Full name is required',
      })
      .min(3, { message: 'Name must be at least 3 characters long' })
      .max(60, { message: 'Name cannot be longer than 60 characters' }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({ message: 'Invalid email address' })
      .max(99, { message: 'Email cannot be longer than 99 characters' }),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(20, { message: 'Password cannot be longer than 20 characters' }),
    role: z.enum(['user', 'admin']).optional(),
    interests: z.array(z.string()).optional(),
  }),
});


export const UserValidation = {
  createUserZodSchema,

};
