import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { PostValidation } from './post.validation';
import { PostController } from './post.controller';

const router = express.Router();

router.post(
  '/create',
  validateRequest(PostValidation.createPostZodSchema),
  // AdminTokenValidation(['admin']),
  PostController.postCreate
);

export const PostRoutes = router;
