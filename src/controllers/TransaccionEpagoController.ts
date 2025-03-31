import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { TransaccionEpago } from '../entities/TransaccionEpago';
import { Cajero } from '../entities/Cajero';
import { QueryRunner } from 'typeorm';

export class TransaccionEpagoController {
    // Crear nueva transacción
    static async crearTransaccion(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { secuenciaCajero, valor, tipoPago, referencia } = req.body;

            // Validar existencia del cajero
            const cajero = await queryRunner.manager.findOne(Cajero, {
                where: { secuenciaCajero: secuenciaCajero }
            });

            if (!cajero) {
                throw new Error('Cajero no encontrado');
            }

            // Crear transacción
            const transaccion = queryRunner.manager.create(TransaccionEpago, {
                cajero: cajero,
                valor: valor,
                tipoPago: tipoPago,
                referencia: referencia,
                fechaSolicitud: new Date(),
                estado: 'P', // Pendiente por defecto
                fechaIngreso: new Date(),
                usuarioIngreso: (req as any).user.userId
            });

            await queryRunner.manager.save(transaccion);
            await queryRunner.commitTransaction();

            res.status(201).json({
                codigoEpago: transaccion.codigoEpago,
                estado: transaccion.estado,
                valor: transaccion.valor
            });

        } catch (error: unknown) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }

    // Obtener transacciones con filtros
    static async obtenerTransacciones(req: Request, res: Response): Promise<void> {
        try {
            const { estado, fechaInicio, fechaFin } = req.query;

            const query = AppDataSource.getRepository(TransaccionEpago)
                .createQueryBuilder('t')
                .leftJoinAndSelect('t.cajero', 'cajero')
                .select([
                    't.codigoEpago',
                    't.valor',
                    't.estado',
                    't.fechaSolicitud',
                    'cajero.secuenciaCajero'
                ]);

            if (estado) {
                query.andWhere('t.estado = :estado', { estado });
            }

            if (fechaInicio && fechaFin) {
                query.andWhere('t.fechaSolicitud BETWEEN :inicio AND :fin', {
                    inicio: fechaInicio,
                    fin: fechaFin
                });
            }

            const transacciones = await query.getMany();
            res.status(200).json(transacciones);

        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Error desconocido' });
            }
        }
    }

    // Actualizar estado de transacción (P → C = Completada)
    static async actualizarEstado(req: Request, res: Response): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { codigoEpago } = req.params;
            const { estado } = req.body;

            const transaccion = await queryRunner.manager.findOne(TransaccionEpago, {
                where: { codigoEpago: parseInt(codigoEpago) }
            });

            if (!transaccion) {
                throw new Error('Transacción no encontrada');
            }

            if (transaccion.estado === 'C') {
                throw new Error('La transacción ya está completada');
            }

            transaccion.estado = estado;
            transaccion.fechaModificacion = new Date();
            transaccion.usuarioModificacion = (req as any).user.userId;

            await queryRunner.manager.save(transaccion);
            await queryRunner.commitTransaction();

            res.status(200).json({
                codigoEpago: transaccion.codigoEpago,
                nuevoEstado: transaccion.estado
            });

        } catch (error: unknown) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Error desconocido' });
            }
        } finally {
            await queryRunner.release();
        }
    }
}