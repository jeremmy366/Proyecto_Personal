import express, { Request, Response } from 'express';
import cors from 'cors'; // Importar cors
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth';
import pacienteRoutes from './routes/pacientes';
import transaccionRoutes from './routes/transaccionesEpago';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth';
import dotenv from 'dotenv';
import path from 'path';
import upload from './utils/upload';
import { setupSwagger } from './config/swagger';
dotenv.config();
const app = express();
app.use(cors()); // Usar cors para permitir todas las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setupSwagger(app);
app.use('/fotos', express.static(path.resolve(__dirname, '../fotosPaciente')));
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica el estado de la API
 *     description: Retorna un mensaje indicando que la API está funcionando correctamente.
 *     responses:
 *       200:
 *         description: API está operativa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API está funcionando"
 */
app.get('/health', (req: Request, res: Response) => {
    res.send('Servidor OK');
});
// Rutas protegidas
app.use('/autenticacion', authRoutes);
app.use('/agendamiento/pacientes', authMiddleware, pacienteRoutes);
app.use('/transacciones', authMiddleware, transaccionRoutes);
// Endpoint de subida de archivos
app.post('/upload', upload.single('foto'), (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'Archivo no válido' });
    } else {
        res.json({ filename: req.file.filename });
    }
});
// Middleware de errores
app.use(errorHandler);
// Inicialización
AppDataSource.initialize()
    .then(() => {
        console.log('Base de datos conectada');
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor en puerto ${process.env.PORT || 3000}`);
        });
    })
    .catch(error => {
        console.error('Error fatal:', error);
        process.exit(1);
    });