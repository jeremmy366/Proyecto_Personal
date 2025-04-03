import { Router } from 'express';
import { TransaccionEpagoController } from '../controllers/TransaccionEpagoController';
import { authMiddleware } from '../middlewares/auth';
import { body } from 'express-validator';
import moment from 'moment';

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
router.post(
    '/',
    authMiddleware,
    [
        body('secuenciaCajero').notEmpty().withMessage('El codigo del cajero es obligatorio'),
        body('fechaSolicitud').custom(value => {
            if (!moment(value, 'DD/MM/YYYY HH:mm:ss', true).isValid()) {
                throw new Error('La fechaSolicitud debe tener el formato DD/MM/YYYY HH:mm:ss');
            }
            return true;
        }),
        body('valor').isFloat({ gt: 0 }).withMessage('El valor debe ser mayor a 0')
    ],
    TransaccionEpagoController.crearTransaccion
);

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
router.put(
    '/:codigoEpago',
    authMiddleware,
    [
        body('secuenciaCajero').notEmpty().withMessage('El codigo del cajero es obligatorio'),
        body('fechaSolicitud').custom(value => {
            if (!moment(value, 'DD/MM/YYYY HH:mm:ss', true).isValid()) {
                throw new Error('La fechaSolicitud debe tener el formato DD/MM/YYYY HH:mm:ss');
            }
            return true;
        }),
        body('valor').isFloat({ gt: 0 }).withMessage('El valor debe ser mayor a 0')
    ],
    TransaccionEpagoController.actualizarTransaccion // Crea este método
);

router.delete(
    '/:codigoEpago',
    authMiddleware,
    TransaccionEpagoController.eliminarTransaccion
);

export default router;
