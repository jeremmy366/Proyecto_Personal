import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { TransaccionEpago } from '../entities/TransaccionEpago';
import { Paciente } from '../entities/Paciente';
import { Cajero } from '../entities/Cajero';
import { QueryRunner } from 'typeorm';

export class TransaccionEpagoController {
    // Crear nueva transacción
    static async crearTransaccion(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { idPaciente, idCajero, monto, tipoPago, referencia } = req.body;

            // Validar existencia de paciente y cajero
            const pacienteRepo = queryRunner.manager.getRepository(Paciente);
            const cajeroRepo = queryRunner.manager.getRepository(Cajero);

            const paciente = await pacienteRepo.findOneBy({ idPaciente });
            if (!paciente) throw new Error('Paciente no encontrado');

            const cajero = await cajeroRepo.findOneBy({ idCajero });
            if (!cajero) throw new Error('Cajero no encontrado');

            // Crear transacción
            const transaccion = queryRunner.manager.create(TransaccionEpago, {
                paciente,
                cajero,
                monto: parseFloat(monto),
                tipoPago,
                referencia,
                estado: 'P', // Pendiente por defecto
                fechaTransaccion: new Date(),
                fechaIngreso: new Date(),
                usuarioIngreso: (req as any).user.userId
            });

            await queryRunner.manager.save(transaccion);
            await queryRunner.commitTransaction();

            res.status(201).json({
                idTransaccion: transaccion.idTransaccion,
                estado: transaccion.estado,
                monto: transaccion.monto
            });

        } catch (error: unknown) {
            if (error instanceof Error) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ error: error.message || 'Error al crear transacción' });
            } else {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }

    // Obtener todas las transacciones con filtros
    static async obtenerTransacciones(req: Request, res: Response) {
        try {
            const { estado, fechaInicio, fechaFin } = req.query;
            const repo = AppDataSource.getRepository(TransaccionEpago);

            const query = repo.createQueryBuilder('t')
                .leftJoinAndSelect('t.paciente', 'paciente')
                .leftJoinAndSelect('t.cajero', 'cajero')
                .select([
                    't.idTransaccion',
                    't.monto',
                    't.estado',
                    't.fechaTransaccion',
                    'paciente.nombre',
                    'cajero.nombre'
                ]);

            if (estado) query.andWhere('t.estado = :estado', { estado });
            if (fechaInicio && fechaFin) {
                query.andWhere('t.fechaTransaccion BETWEEN :inicio AND :fin', {
                    inicio: fechaInicio,
                    fin: fechaFin
                });
            }

            const transacciones = await query.getMany();
            res.status(200).json(transacciones);

        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message || 'Error al obtener transacciones' });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    }

    // Actualizar estado de transacción
    static async actualizarEstado(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { idTransaccion } = req.params;
            const { estado } = req.body;
            const repo = queryRunner.manager.getRepository(TransaccionEpago);

            const transaccion = await repo.findOne({
                where: { idTransaccion: parseInt(idTransaccion) },
                lock: { mode: "optimistic", version: 1 } // Agregar version
            });

            if (!transaccion) throw new Error('Transacción no encontrada');
            if (transaccion.estado === 'C') throw new Error('Transacción ya está completada');

            transaccion.estado = estado;
            transaccion.fechaModificacion = new Date();
            transaccion.usuarioModificacion = (req as any).user.userId;

            await queryRunner.manager.save(transaccion);
            await queryRunner.commitTransaction();

            res.status(200).json({
                idTransaccion: transaccion.idTransaccion,
                nuevoEstado: transaccion.estado
            });

        } catch (error: unknown) {
            if (error instanceof Error) {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ error: error.message || 'Error al actualizar' });
            } else {
                await queryRunner.rollbackTransaction();
                res.status(400).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }
}
