import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body } from 'express-validator';

const router = Router();

router.post('/login',
    body('codigoUsuario').notEmpty(),
    body('clave').notEmpty(),
    AuthController.login
);

export default router;