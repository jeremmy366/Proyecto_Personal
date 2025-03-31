import { Router } from 'express';
import { TransaccionEpagoController } from '../controllers/TransaccionEpagoController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, TransaccionEpagoController.crearTransaccion);
router.get('/', authMiddleware, TransaccionEpagoController.obtenerTransacciones);
router.put('/:idTransaccion', authMiddleware, TransaccionEpagoController.actualizarEstado);

export default router;
