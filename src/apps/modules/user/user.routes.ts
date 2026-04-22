import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import { TokenRoleAccess } from '../../middlewares/TokenRoleAccess';

const router = express.Router();
// login user/admin
router.post('/login', UserController.login);

// only addmin can access
router.post(
  '/create',
  validateRequest(UserValidation.createUserZodSchema),
  TokenRoleAccess(['admin']),
  UserController.userCreate
);

router.get('/', TokenRoleAccess(['admin']), UserController.AllUser);

router.delete(
  '/delete/:id',
  TokenRoleAccess(['admin']),
  UserController.deleteUser
);
router.get(
  '/singel-user/:id',
  TokenRoleAccess(['user']),
  UserController.getSingelUser
);
router.patch(
  '/update/:id',
  TokenRoleAccess(['admin']),
  UserController.updateSingleUser
);
// only user profile update
router.patch(
  '/profile/:id',
  TokenRoleAccess(['user', 'admin']),
  UserController.updateUserProfile
);

// Group users by interests (admin only)
router.get(
  '/group-by-interests',
  TokenRoleAccess(['admin']),
  UserController.groupByInterests
);

// Get all posts for a specific user (user or admin)
router.get(
  '/:id/posts',
  TokenRoleAccess(['user']),
  UserController.getUserPosts
);

export const UserRoutes = router;
