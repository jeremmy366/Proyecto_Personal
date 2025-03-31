import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /autenticacion/login:
 *   post:
 *     summary: Autenticación de usuario
 *     description: Realiza la autenticación básica y devuelve un Bearer token (JWT).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigoUsuario:
 *                 type: string
 *               clave:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el Bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: El token JWT de acceso.
 *       400:
 *         description: Error en la validación de datos.
 *       401:
 *         description: Credenciales inválidas.
 */
router.post(
    '/login',
    body('codigoUsuario').notEmpty(),
    body('clave').notEmpty(),
    AuthController.login
);

export default router;
