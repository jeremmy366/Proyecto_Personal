import { Router } from 'express';
import { TransaccionEpagoController } from '../controllers/TransaccionEpagoController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /transacciones:
 *   post:
 *     description: Crear una nueva transacción de ePago
 *     parameters:
 *       - in: body
 *         name: transaccion
 *         description: Datos de la transacción
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             monto:
 *               type: integer
 *             metodoPago:
 *               type: string
 *     responses:
 *       200:
 *         description: Transacción creada correctamente
 *       400:
 *         description: Error de validación
 */
router.post('/', authMiddleware, TransaccionEpagoController.crearTransaccion);

/**
 * @swagger
 * /transacciones:
 *   get:
 *     description: Obtener todas las transacciones
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
router.get('/', authMiddleware, TransaccionEpagoController.obtenerTransacciones);

/**
 * @swagger
 * /transacciones/{idTransaccion}:
 *   put:
 *     description: Actualizar el estado de una transacción
 *     parameters:
 *       - in: path
 *         name: idTransaccion
 *         required: true
 *         type: string
 *       - in: body
 *         name: estado
 *         description: Nuevo estado de la transacción
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             estado:
 *               type: string
 *     responses:
 *       200:
 *         description: Transacción actualizada correctamente
 *       400:
 *         description: Error de validación
 */
router.put('/:idTransaccion', authMiddleware, TransaccionEpagoController.actualizarEstado);

export default router;
