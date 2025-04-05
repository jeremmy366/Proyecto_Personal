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
 *     summary: Crear una transacción Epago
 *     description: Registra una nueva transacción Epago.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secuenciaCajero:
 *                 type: integer
 *                 example: 1
 *               valor:
 *                 type: number
 *                 example: 100.50
 *               tipoPago:
 *                 type: string
 *                 example: "Tarjeta"
 *               referencia:
 *                 type: string
 *                 example: "REF123"
 *               fechaSolicitud:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-08-10T17:21:50Z"
 *     responses:
 *       201:
 *         description: Transacción creada.
 *       400:
 *         description: Error en los datos enviados.
 *       401:
 *         description: No autorizado.
 */
router.post(
    '/',
    authMiddleware,
    [
        body('secuenciaCajero').notEmpty().withMessage('El código del cajero es obligatorio'),
        body('fechaSolicitud').custom(value => {
            if (!moment(value).isValid()) {
                throw new Error('La fechaSolicitud no es una fecha válida');
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
 *     summary: Listar transacciones Epago
 *     description: Obtiene una lista de transacciones con filtros y paginación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio (ej. 10/08/2024 00:00:00)
 *       - in: query
 *         name: fechaHasta
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin (ej. 10/08/2024 23:59:59)
 *       - in: query
 *         name: codigoEpago
 *         schema:
 *           type: integer
 *         description: Filtrar por código Epago
 *       - in: query
 *         name: secuenciaCajero
 *         schema:
 *           type: integer
 *         description: Filtrar por secuencia de cajero
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de transacciones obtenida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TransaccionEpago'
 *                 totalRows:
 *                   type: integer
 *                   example: 25
 *       400:
 *         description: Fechas inválidas o faltantes.
 *       401:
 *         description: No autorizado.
 */
router.get('/', authMiddleware, TransaccionEpagoController.obtenerTransacciones);

/**
 * @swagger
 * /transacciones/{codigoEpago}:
 *   put:
 *     summary: Actualizar una transacción Epago
 *     description: Modifica los datos de una transacción existente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigoEpago
 *         required: true
 *         schema:
 *           type: integer
 *         description: Código Epago de la transacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secuenciaCajero:
 *                 type: integer
 *                 example: 1
 *               valor:
 *                 type: number
 *                 example: 100.50
 *               tipoPago:
 *                 type: string
 *                 example: "Tarjeta"
 *               referencia:
 *                 type: string
 *                 example: "REF123"
 *               fechaSolicitud:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-08-10T17:21:50Z"
 *     responses:
 *       200:
 *         description: Transacción actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransaccionEpago'
 *       400:
 *         description: Error en los datos enviados.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Transacción no encontrada.
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
        body('valor').isFloat({ gt: 0 }).withMessage('El valor debe ser mayor a 0'),
        body('usuario_ingresado').notEmpty().withMessage('El usuario es obligatorio')
    ],
    TransaccionEpagoController.actualizarTransaccion // Crea este método
);

/**
 * @swagger
 * /transacciones/{codigoEpago}:
 *   delete:
 *     summary: Inactivar una transacción Epago
 *     description: Cambia el estado de la transacción a inactivo (eliminación lógica).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigoEpago
 *         required: true
 *         schema:
 *           type: integer
 *         description: Código Epago de la transacción
 *     responses:
 *       200:
 *         description: Transacción inactivada.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Transacción no encontrada.
 */
router.delete(
    '/:codigoEpago',
    authMiddleware,
    TransaccionEpagoController.eliminarTransaccion
);

export default router;
