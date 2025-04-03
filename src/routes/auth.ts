import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /autenticacion/login:
 *   post:
 *     summary: Autenticación de usuario
 *     description: Autentica a un usuario y devuelve un token JWT si las credenciales son válidas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigoUsuario
 *               - clave
 *             properties:
 *               codigoUsuario:
 *                 type: string
 *                 description: Código único del usuario
 *               clave:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Autenticación exitosa, devuelve el token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: Token JWT de acceso
 *       400:
 *         description: Faltan datos requeridos.
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
