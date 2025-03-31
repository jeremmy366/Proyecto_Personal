import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { checkRole } from '../middlewares/auth';
import { PacienteController } from '../controllers/PacienteController';
import upload from '../utils/upload';

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
    '/:id',
    authMiddleware,
    PacienteController.obtenerPacientePorId
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
