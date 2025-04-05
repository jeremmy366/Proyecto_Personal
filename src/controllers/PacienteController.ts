import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Paciente } from '../entities/Paciente';
import { QueryRunner } from 'typeorm';
import { TipoIdentificacion } from '../entities/TipoIdentificacion';
import { formatDate } from '../utils/dateFormat';

export class PacienteController {
    // Crear nuevo paciente
    static async crearPaciente(req: Request, res: Response, next: NextFunction): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Se espera que el cliente envíe "codigoTipoIdentificacion"
            const { codigoTipoIdentificacion, email, ...resto } = req.body;
            // Validar que exista el tipo de identificación usando el campo correcto
            const tipoRepo = queryRunner.manager.getRepository(TipoIdentificacion);
            const tipo = await tipoRepo.findOne({ where: { codigoTipoIdentificacion } });
            if (!tipo) {
                throw new Error('Tipo de identificación no existe');
            }
            const pacienteRepo = queryRunner.manager.getRepository(Paciente);
            const paciente = pacienteRepo.create({
                ...resto,
                email,
                tipoIdentificacion: tipo,
                estado: 'S',
                fechaIngreso: new Date(),
                usuarioIngreso: (req as any).user.userId
            });
            await pacienteRepo.save(paciente);
            await queryRunner.commitTransaction();
            res.status(201).json(paciente);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }
    

    // Listar pacientes con filtros
    static async listarPacientes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { numero_identificacion, nombre_completo, email, estado, page = '1', limit = '10' } = req.query;
            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);
            const offset = (pageNum - 1) * limitNum;

            const query = AppDataSource.getRepository(Paciente)
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.tipoIdentificacion', 'tipoIdentificacion');

            // Filtros
            if (numero_identificacion) {
                query.andWhere('p.numeroIdentificacion = :numero', { numero: numero_identificacion });
            }
            if (nombre_completo) {
                query.andWhere('p.nombreCompleto LIKE :nombre', { nombre: `%${nombre_completo}%` });
            }
            if (email) {
                query.andWhere('p.email = :email', { email });
            }
            // Por defecto, si no se especifica estado, traer activos ('S')
            if (estado) {
                query.andWhere('p.estado = :estado', { estado });
            } else {
                query.andWhere('p.estado = :estado', { estado: 'S' });
            }

            // Paginación
            query.skip(offset).take(limitNum);

            const [pacientes, totalRows] = await query.getManyAndCount();

            res.status(200).json({
                rows: pacientes,
                totalRows
            });
        } catch (error) {
            next(error);
        }
    }

    // Obtener paciente por ID
    static async obtenerPacientePorId(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const paciente = await AppDataSource.getRepository(Paciente).findOneOrFail({
                where: { idPaciente: parseInt(id) },
                relations: ['tipoIdentificacion']
            });
            // Convertir fechas antes de responder
            const pacienteResponse = {
                ...paciente,
                fechaIngreso: formatDate(paciente.fechaIngreso),
                fechaModificacion: paciente.fechaModificacion ? formatDate(paciente.fechaModificacion) : null
            };
            res.status(200).json(pacienteResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(404).json({ error: `Paciente no encontrado: ${error.message}` });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    }

    // Actualizar paciente
    static async actualizarPaciente(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id } = req.params;
            const pacienteRepo = queryRunner.manager.getRepository(Paciente);
            const paciente = await pacienteRepo.findOneOrFail({
                where: { idPaciente: parseInt(id) }
            });

            // Campos actualizables
            const camposPermitidos = [
                'primerNombre',
                'segundoNombre',
                'primerApellido',
                'segundoApellido',
                'nombreCompleto',
                'email'
            ];

            camposPermitidos.forEach(campo => {
                if (req.body[campo] !== undefined) {
                    (paciente as any)[campo] = req.body[campo];
                }
            });

            // Auditoría
            paciente.fechaModificacion = new Date();
            paciente.usuarioModificacion = (req as any).user.userId;

            await queryRunner.manager.save(paciente);
            await queryRunner.commitTransaction();
            res.status(200).json(paciente);
        } catch (error: unknown) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }

    // Eliminar lógico
    static async eliminarPaciente(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id } = req.params;
            const pacienteRepo = queryRunner.manager.getRepository(Paciente);
            const paciente = await pacienteRepo.findOneOrFail({
                where: { idPaciente: parseInt(id) }
            });

            if (paciente.estado === 'N') {
                throw new Error('El paciente ya está inactivo');
            }

            paciente.estado = 'N';
            paciente.fechaModificacion = new Date();
            paciente.usuarioModificacion = (req as any).user.userId;

            await queryRunner.manager.save(paciente);
            await queryRunner.commitTransaction();
            res.status(200).json({ message: 'Paciente desactivado' });
        } catch (error: unknown) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }

    // Subir foto (actualiza ruta_foto)
    static async subirFoto(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const pacienteRepo = AppDataSource.getRepository(Paciente);
            const paciente = await pacienteRepo.findOneOrFail({
                where: { idPaciente: parseInt(id) }
            });

            if (!req.file) {
                res.status(400).json({ error: 'No se proporcionó un archivo válido' });
                return;
            }

            const filePath = `/fotos/${req.file.filename}`;
            paciente.rutaFoto = filePath;

            await pacienteRepo.save(paciente);

            res.status(200).json({
                message: 'Foto actualizada',
                rutaFoto: paciente.rutaFoto
            });
        } catch (error: unknown) {
            console.error('Error al subir foto:', error); // Agrega logging para depuración
            if (error instanceof Error) {
                if (error.message.includes('findOneOrFail')) {
                    res.status(404).json({ error: 'Paciente no encontrado' });
                } else {
                    res.status(500).json({ error: `Error al procesar la foto: ${error.message}` });
                }
            } else {
                res.status(500).json({ error: 'Error desconocido al subir la foto' });
            }
        }
    }
}