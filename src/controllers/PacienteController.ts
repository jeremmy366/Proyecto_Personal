import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Paciente } from '../entities/Paciente';
import { QueryRunner } from 'typeorm';

export class PacienteController {
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

    static async listarPacientes(req: Request, res: Response): Promise<void> {
        try {
            const { nombre, estado } = req.query;

            // Aseguramos que estado sea un string y nombre también
            const estadoQuery = typeof estado === 'string' ? estado : undefined;
            const nombreQuery = typeof nombre === 'string' ? `%${nombre}%` : undefined;

            const pacientes = await AppDataSource.getRepository(Paciente).find({
                where: {
                    nombre: nombreQuery,  // Aquí usamos el nombre procesado
                    estado: estadoQuery   // Aquí usamos el estado procesado
                }
            });

            res.status(200).json(pacientes);
        } catch (error) {
            res.status(500).json({ error: 'Error al listar pacientes' });
        }
    }

    static async obtenerHistorialMedico(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // Lógica para obtener historial médico del paciente por ID
            const historial = await AppDataSource.getRepository(Paciente)
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.historialMedico', 'historial')  // Suponiendo que tienes una relación de historial médico
                .where('p.idPaciente = :id', { id })
                .getOne();

            if (!historial) {
                res.status(404).json({ error: 'Historial no encontrado' });
                return;  // Terminamos la ejecución aquí para no continuar
            }

            res.status(200).json(historial);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message || 'Error al obtener historial médico' });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    }

    static async obtenerPacientePorId(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const paciente = await AppDataSource.getRepository(Paciente).findOneOrFail({
                where: { idPaciente: parseInt(id) },
                relations: { tipoIdentificacion: true }
            });

            res.status(200).json(paciente);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: `Error al obtener paciente: ${error.message}` });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    }

    static async actualizarPaciente(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id } = req.params;
            const pacienteRepo = queryRunner.manager.getRepository(Paciente);
            const paciente = await pacienteRepo.findOneOrFail({
                where: { idPaciente: parseInt(id) },
            });

            const { nombre, apellido, numeroIdentificacion } = req.body;
            paciente.nombre = nombre || paciente.nombre;
            paciente.apellido = apellido || paciente.apellido;
            paciente.numeroIdentificacion = numeroIdentificacion || paciente.numeroIdentificacion;

            paciente.fechaModificacion = new Date();
            paciente.usuarioModificacion = (req as any).user.userId;

            await queryRunner.manager.save(paciente);
            await queryRunner.commitTransaction();

            res.status(200).json(paciente);
        } catch (error: unknown) {
            if (error instanceof Error) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ error: error.message || 'Error al actualizar' });
            } else {
                res.status(400).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }

    static async eliminarPaciente(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id } = req.params;
            const pacienteRepo = queryRunner.manager.getRepository(Paciente);
            const paciente = await pacienteRepo.findOneOrFail({ where: { idPaciente: parseInt(id) } });

            if (paciente.estado === 'I') throw new Error('Paciente ya está inactivo');

            paciente.estado = 'I';
            paciente.fechaModificacion = new Date();
            paciente.usuarioModificacion = (req as any).user.userId;

            await queryRunner.manager.save(paciente);
            await queryRunner.commitTransaction();

            res.status(200).json({ message: 'Paciente desactivado correctamente' });
        } catch (error: unknown) {
            if (error instanceof Error) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ error: error.message || 'Error al eliminar' });
            } else {
                res.status(400).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }

    static async subirFoto(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const paciente = await AppDataSource.getRepository(Paciente).findOne({
                where: { idPaciente: parseInt(id) }
            });

            if (!paciente) {
                res.status(404).json({ error: 'Paciente no encontrado' });
                return;  // Terminamos la ejecución aquí
            }

            // Lógica para actualizar la foto del paciente
            paciente.foto = req.file?.filename;  // Suponiendo que tienes un campo 'foto' en la entidad
            await AppDataSource.getRepository(Paciente).save(paciente);

            res.status(200).json({ message: 'Foto actualizada correctamente', filename: req.file?.filename });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message || 'Error al subir foto' });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    }
}