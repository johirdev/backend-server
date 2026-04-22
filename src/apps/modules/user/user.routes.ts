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
  UserController.userCreate
);
router.get('/', AdminTokenValidation(['admin']), UserController.AllUser);
router.delete(
  '/delete/:id',
  AdminTokenValidation(['admin']),
  UserController.deleteUser
);

export const UserRoutes = router;
