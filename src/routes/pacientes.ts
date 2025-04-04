import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { checkRole } from '../middlewares/auth';
import { PacienteController } from '../controllers/PacienteController';
import upload from '../utils/upload';
import { body } from 'express-validator';
import { AppDataSource } from '../config/database';
import { Paciente } from '../entities/Paciente';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * @swagger
 * /agendamiento/pacientes:
 *   post:
 *     summary: Crear un nuevo paciente
 *     description: Registra un nuevo paciente con sus datos y opcionalmente una foto.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               primerNombre:
 *                 type: string
 *                 example: "Juan"
 *               segundoNombre:
 *                 type: string
 *                 example: "Carlos"
 *               primerApellido:
 *                 type: string
 *                 example: "Pérez"
 *               segundoApellido:
 *                 type: string
 *                 example: "Gómez"
 *               nombreCompleto:
 *                 type: string
 *                 example: "Juan Carlos Pérez Gómez"
 *               numeroIdentificacion:
 *                 type: string
 *                 example: "0999999999"
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *               codigoTipoIdentificacion:
 *                 type: string
 *                 example: "CED"
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Foto del paciente (opcional)
 *     responses:
 *       201:
 *         description: Paciente creado con éxito.
 *       400:
 *         description: Error en los datos enviados.
 *       401:
 *         description: No autorizado.
 */
router.post(
    '/',
    authMiddleware,
    checkRole('admin', 'recepcionista'),
    // Validaciones:
    body('email').isEmail().withMessage('El email no es válido'),
    body('codigoTipoIdentificacion').notEmpty().withMessage('El tipo de identificación es requerido'),
    upload.single('foto'),
    PacienteController.crearPaciente
);

/**
 * @swagger
 * /agendamiento/pacientes:
 *   get:
 *     summary: Listar pacientes
 *     description: Obtiene una lista de pacientes con filtros opcionales y paginación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: numero_identificacion
 *         schema:
 *           type: string
 *         description: Filtrar por número de identificación
 *       - in: query
 *         name: nombre_completo
 *         schema:
 *           type: string
 *         description: Filtrar por nombre completo
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrar por email
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [S, N]
 *         description: Filtrar por estado (S=Activo, N=Inactivo)
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
 *         description: Lista de pacientes obtenida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Paciente'
 *                 totalRows:
 *                   type: integer
 *                   example: 50
 *       401:
 *         description: No autorizado.
 */
router.get(
    '/',
    authMiddleware,
    checkRole('medico', 'admin'),
    PacienteController.listarPacientes
);

/**
 * @swagger
 * /agendamiento/pacientes/{id}/foto:
 *   get:
 *     summary: Obtener la foto de un paciente
 *     description: Retorna la foto asociada al paciente especificado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Foto encontrada.
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Paciente o foto no encontrada.
 *       401:
 *         description: No autorizado.
 */
router.get(
    '/:id/foto',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            // Convertir id a número y verificar que es válido
            const idPaciente = parseInt(id);
            if (isNaN(idPaciente)) {
                // No es necesario retornar, solo envía la respuesta de error
                res.status(400).json({ error: 'ID de paciente no es válido' });
                return; // Aquí se hace el return solo para detener la ejecución después de enviar el error
            }

            // Buscar el paciente para obtener la ruta de la foto
            const paciente = await AppDataSource.getRepository(Paciente).findOneOrFail({
                where: { idPaciente }
            });

            if (!paciente.rutaFoto) {
                res.status(404).json({ error: 'El paciente no tiene foto' });
                return; // Detener ejecución si no hay foto
            }

            // Construir la ruta absoluta
            const fotoPath = path.resolve(__dirname, '../../fotosPaciente', path.basename(paciente.rutaFoto));
            if (!fs.existsSync(fotoPath)) {
                res.status(404).json({ error: 'Archivo de foto no encontrado' });
                return; // Detener ejecución si el archivo no existe
            }

            // Enviar la foto como archivo
            res.sendFile(fotoPath, (err) => {
                if (err) {
                    next(err); // Si hay un error en el envío del archivo, pasamos el error al siguiente middleware
                }
            });

        } catch (error) {
            next(error); // En caso de cualquier otro error, pasar al middleware de manejo de errores
        }
    }
);


/**
 * @swagger
 * /agendamiento/pacientes/{id}:
 *   put:
 *     summary: Actualizar un paciente
 *     description: Actualiza los datos de un paciente existente, excluyendo tipo y número de identificación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primerNombre:
 *                 type: string
 *                 example: "Juan"
 *               segundoNombre:
 *                 type: string
 *                 example: "Carlos"
 *               primerApellido:
 *                 type: string
 *                 example: "Pérez"
 *               segundoApellido:
 *                 type: string
 *                 example: "Gómez"
 *               nombreCompleto:
 *                 type: string
 *                 example: "Juan Carlos Pérez Gómez"
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *     responses:
 *       200:
 *         description: Paciente actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paciente'
 *       400:
 *         description: Error en los datos enviados.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Paciente no encontrado.
 */
router.put(
    '/:id',
    authMiddleware,
    checkRole('admin'),
    [
        // Validar email si se envía
        body('email').optional().isEmail().withMessage('El email no es válido'),
        // Evitar que se envíen campos no permitidos (puedes agregar un custom validator)
        body('tipoIdentificacion').not().exists().withMessage('No se puede modificar el tipo de identificación'),
        body('numeroIdentificacion').not().exists().withMessage('No se puede modificar el número de identificación')
    ],
    upload.single('foto'),
    PacienteController.actualizarPaciente
);

/**
 * @swagger
 * /agendamiento/pacientes/{id}:
 *   delete:
 *     summary: Inactivar un paciente
 *     description: Cambia el estado del paciente a inactivo (eliminación lógica).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente inactivado.
 *       400:
 *         description: El paciente ya está inactivo.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Paciente no encontrado.
 */
router.delete(
    '/:id',
    authMiddleware,
    checkRole('admin'),
    PacienteController.eliminarPaciente
);

/**
 * @swagger
 * /agendamiento/pacientes/{id}/foto:
 *   post:
 *     summary: Subir o actualizar la foto de un paciente
 *     description: Permite subir o reemplazar la foto de un paciente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de la foto
 *     responses:
 *       200:
 *         description: Foto subida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Foto subida correctamente"
 *                 rutaFoto:
 *                   type: string
 *                   example: "/uploads/foto123.jpg"
 *       400:
 *         description: Error en el archivo enviado.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Paciente no encontrado.
 */
router.post(
    '/:id/foto',
    authMiddleware,
    upload.single('foto'),
    PacienteController.subirFoto
);

export default router;
