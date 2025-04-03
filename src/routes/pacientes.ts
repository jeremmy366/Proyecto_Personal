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
 *     description: Crear un nuevo paciente, incluye subida de foto
 *     parameters:
 *       - in: body
 *         name: paciente
 *         description: Datos del paciente
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *             edad:
 *               type: integer
 *       - in: formData
 *         name: foto
 *         type: file
 *         description: Foto del paciente
 *     responses:
 *       200:
 *         description: Paciente creado correctamente
 *       400:
 *         description: Error de validación
 */
router.post(
    '/',
    authMiddleware,
    checkRole('admin', 'recepcionista'),
    // Validaciones:
    body('email').isEmail().withMessage('El email no es válido'),
    body('tipoIdentificacion').notEmpty().withMessage('El tipo de identificación es requerido'),
    // Otros validadores si es necesario
    upload.single('foto'),
    PacienteController.crearPaciente
);

/**
 * @swagger
 * /agendamiento/pacientes:
 *   get:
 *     description: Listar pacientes con filtros
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get(
    '/',
    authMiddleware,
    checkRole('medico', 'admin'),
    PacienteController.listarPacientes
);

/**
 * @swagger
 * /agendamiento/pacientes/{id}:
 *   get:
 *     description: Obtener un paciente por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Información del paciente
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
 *     description: Actualizar información de un paciente, incluyendo foto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: foto
 *         type: file
 *         description: Foto del paciente
 *     responses:
 *       200:
 *         description: Paciente actualizado correctamente
 *       400:
 *         description: Error de validación
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
 *     description: Eliminar (desactivar) un paciente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Paciente desactivado correctamente
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
 *     description: Subir o actualizar foto de un paciente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: foto
 *         type: file
 *         description: Foto del paciente
 *     responses:
 *       200:
 *         description: Foto subida o actualizada correctamente
 */
router.post(
    '/:id/foto',
    authMiddleware,
    upload.single('foto'),
    PacienteController.subirFoto
);

export default router;
