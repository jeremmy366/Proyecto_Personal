import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { checkRole } from '../middlewares/auth';
import { PacienteController } from '../controllers/PacienteController';
import upload from '../utils/upload'; // Ruta corregida

const router = Router();

/**
 * @route POST /agendamiento/pacientes
 * @description Crear nuevo paciente
 * @access Privado (solo usuarios con rol 'admin' o 'recepcionista')
 */
router.post(
    '/',
    authMiddleware,
    checkRole('admin', 'recepcionista'),
    upload.single('foto'),
    PacienteController.crearPaciente
);

/**
 * @route GET /agendamiento/pacientes
 * @description Listar pacientes con filtros
 * @access Privado (solo roles 'medico', 'admin')
 */
router.get(
    '/',
    authMiddleware,
    checkRole('medico', 'admin'),
    PacienteController.listarPacientes
);

/**
 * @route GET /agendamiento/pacientes/:id
 * @description Obtener detalle de paciente por ID
 * @access Privado (todos los roles autenticados)
 */
router.get(
    '/:id',
    authMiddleware,
    PacienteController.obtenerPacientePorId
);

/**
 * @route PUT /agendamiento/pacientes/:id
 * @description Actualizar información de paciente
 * @access Privado (solo 'admin')
 */
router.put(
    '/:id',
    authMiddleware,
    checkRole('admin'),
    upload.single('foto'),
    PacienteController.actualizarPaciente
);

/**
 * @route DELETE /agendamiento/pacientes/:id
 * @description Eliminar lógico de paciente
 * @access Privado (solo 'admin')
 */
router.delete(
    '/:id',
    authMiddleware,
    checkRole('admin'),
    PacienteController.eliminarPaciente
);

// Rutas adicionales
router.get(
    '/historial/:id',
    authMiddleware,
    checkRole('medico', 'admin'),
    PacienteController.obtenerHistorialMedico
);

router.post(
    '/:id/foto',
    authMiddleware,
    upload.single('foto'),
    PacienteController.subirFoto
);

export default router;