import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import { AdminTokenValidation } from '../../middlewares/adminTokenValidation';
// atuthValidationRoute(),

const router = express.Router();

// create a user
router.post(
  '/create',
  validateRequest(UserValidation.createUserZodSchema),
  AdminTokenValidation(['admin']),
  UserController.userCreate
);
router.get('/', AdminTokenValidation(['admin']), UserController.AllUser);
router.delete(
  '/delete/:id',
  AdminTokenValidation(['admin']),
  UserController.deleteUser
);
// login user/admin
router.post('/login', UserController.login);

export const UserRoutes = router;
