import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { PostValidation } from './post.validation';
import { PostController } from './post.controller';
import { TokenRoleAccess } from '../../middlewares/TokenRoleAccess';

const router = express.Router();

router.post(
  '/create',
  validateRequest(PostValidation.createPostZodSchema),
  TokenRoleAccess(['admin', 'user']),
  PostController.postCreate
);
router.get('/', PostController.AllPost);

router.patch(
  '/update/:id',
  TokenRoleAccess(['admin', 'user']),
  PostController.updateSinglePost
);
router.delete(
  '/delete/:id',
  TokenRoleAccess(['admin', 'user']),
  PostController.deletePost
);

export const PostRoutes = router;
