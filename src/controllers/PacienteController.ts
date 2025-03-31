import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Paciente } from '../entities/Paciente';
import { QueryRunner } from 'typeorm';

export class PacienteController {
    // Crear nuevo paciente
    static async crearPaciente(req: Request, res: Response): Promise<void> {
        try {
            const pacienteData = req.body;

            const paciente = AppDataSource.getRepository(Paciente).create({
                ...pacienteData,
                estado: 'S',
                fechaIngreso: new Date(),
                usuarioIngreso: (req as any).user.userId
            });

            await AppDataSource.getRepository(Paciente).save(paciente);
            res.status(201).json(paciente);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear paciente' });
        }
    }

    // Listar pacientes con filtros
    static async listarPacientes(req: Request, res: Response): Promise<void> {
        try {
            const { nombreCompleto, estado } = req.query;

            const query = AppDataSource.getRepository(Paciente)
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.tipoIdentificacion', 'tipoIdentificacion');

            if (nombreCompleto) {
                query.andWhere('p.nombreCompleto LIKE :nombre', {
                    nombre: `%${nombreCompleto}%`
                });
            }

            if (estado) {
                query.andWhere('p.estado = :estado', { estado });
            }

            const pacientes = await query.getMany();
            res.status(200).json(pacientes);
        } catch (error) {
            res.status(500).json({ error: 'Error al listar pacientes' });
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
            res.status(200).json(paciente);
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
                'numeroIdentificacion',
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
            const paciente = await AppDataSource.getRepository(Paciente).findOneOrFail({
                where: { idPaciente: parseInt(id) }
            });

            if (!req.file) {
                res.status(400).json({ error: 'Archivo no válido' });
                return;
            }

            paciente.rutaFoto = `/fotos/${req.file.filename}`;
            await AppDataSource.getRepository(Paciente).save(paciente);

            res.status(200).json({
                message: 'Foto actualizada',
                rutaFoto: paciente.rutaFoto
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    }
}