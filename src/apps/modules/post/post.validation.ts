import { z } from 'zod';

// create a Post zod validation
const createPostZodSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(3, { message: 'Title must be at least 3 characters long' })
      .max(120, { message: 'Title cannot be longer than 120 characters' }),
    content: z
      .string({ required_error: 'Content is required' })
      .min(1, { message: 'Content must not be empty' }),
  }),
});

export const PostValidation = {
  createPostZodSchema,
};
