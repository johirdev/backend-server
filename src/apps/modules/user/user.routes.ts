import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import { AdminTokenValidation } from '../../middlewares/adminTokenValidation';
import { UserEmailValidation } from '../../middlewares/userTokenValidation';
// atuthValidationRoute(),

const router = express.Router();
// login user/admin
router.post('/login', UserController.login);

// only addmin can access
router.post(
  '/create',
  validateRequest(UserValidation.createUserZodSchema),
  AdminTokenValidation(['admin']),
  UserController.userCreate
);
router.get(
  '/',
  // AdminTokenValidation(['admin']),
  UserController.AllUser
);

router.delete(
  '/delete/:id',
  AdminTokenValidation(['admin']),
  UserController.deleteUser
);
router.patch('/update/:id', UserController.updateSingleUser);
// only user profile update
router.patch(
  '/profile/:id',
  UserEmailValidation(),
  UserController.updateUserProfile
);


export const UserRoutes = router;
