import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { TransaccionEpago } from '../entities/TransaccionEpago';
import { Cajero } from '../entities/Cajero';
import { QueryRunner } from 'typeorm';
import { formatDate } from '../utils/dateFormat';
import moment from 'moment';

export class TransaccionEpagoController {
    // Crear nueva transacción
    // Crear nueva transacción
    static async crearTransaccion(req: Request, res: Response, next: NextFunction): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { secuenciaCajero, valor, tipoPago, referencia, fechaSolicitud } = req.body;
            // Validar existencia del cajero
            const cajero = await queryRunner.manager.findOne(Cajero, {
                where: { secuenciaCajero }
            });
            if (!cajero) {
                throw new Error('Cajero no encontrado');
            }
            // Convertir fechaSolicitud a Date usando el formato ISO
            const fechaSolicitudDate = moment(fechaSolicitud).toDate();
            // Crear transacción
            const transaccion = queryRunner.manager.create(TransaccionEpago, {
                cajero: cajero,
                valor: valor,
                tipoPago: tipoPago,
                referencia: referencia,
                fechaSolicitud: fechaSolicitudDate,
                estado: 'S',
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
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }

    static async actualizarTransaccion(req: Request, res: Response, next: NextFunction): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { codigoEpago } = req.params;
            const { secuenciaCajero, fechaSolicitud, valor, tipoPago, referencia, usuario_ingresado } = req.body;
            const transaccionRepo = queryRunner.manager.getRepository(TransaccionEpago);
            const transaccion = await transaccionRepo.findOneOrFail({ where: { codigoEpago: parseInt(codigoEpago) } });

            // Validar existencia del cajero
            const cajero = await queryRunner.manager.findOne(Cajero, { where: { secuenciaCajero } });
            if (!cajero) {
                throw new Error('Cajero no encontrado');
            }

            // Actualizar campos
            transaccion.cajero = cajero;
            transaccion.fechaSolicitud = moment(fechaSolicitud, 'DD/MM/YYYY HH:mm:ss').toDate();
            transaccion.valor = valor;
            transaccion.usuarioIngreso = usuario_ingresado;
            transaccion.fechaModificacion = new Date();
            transaccion.usuarioModificacion = (req as any).user.userId;

            await transaccionRepo.save(transaccion);
            await queryRunner.commitTransaction();
            res.status(200).json({ mensaje: 'Transacción actualizada', transaccion });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }

    // Obtener transacciones con filtros
    static async obtenerTransacciones(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fechaDesde, fechaHasta, codigoEpago, secuenciaCajero, page = '1', limit = '10' } = req.query;
            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);
            const offset = (pageNum - 1) * limitNum;

            // Crear el query builder base
            const query = AppDataSource.getRepository(TransaccionEpago)
                .createQueryBuilder('t')
                .leftJoinAndSelect('t.cajero', 'cajero');

            // Si se envían ambas fechas, aplicar filtro por rango
            if (fechaDesde && fechaHasta) {
                const inicio = moment(fechaDesde as string, 'DD/MM/YYYY HH:mm:ss').toDate();
                const fin = moment(fechaHasta as string, 'DD/MM/YYYY HH:mm:ss').toDate();
                query.where('t.fechaSolicitud BETWEEN :inicio AND :fin', { inicio, fin });
            }

            // Filtros opcionales
            if (codigoEpago) {
                query.andWhere('t.codigoEpago = :codigoEpago', { codigoEpago });
            }
            if (secuenciaCajero) {
                query.andWhere('cajero.secuenciaCajero = :secuenciaCajero', { secuenciaCajero });
            }

            // Siempre filtrar solo los activos
            query.andWhere('t.estado = :estado', { estado: 'S' });

            // Orden y paginación
            query.orderBy('t.fechaIngreso', 'DESC');
            query.skip(offset).take(limitNum);

            const [transacciones, totalRows] = await query.getManyAndCount();

            const rows = transacciones.map(t => ({
                codigo_epago: t.codigoEpago, // o si la propiedad en la entidad es 'codigo_epago', úsala directamente
                fecha_solicitud: formatDate(t.fechaSolicitud),
                secuencia_cajero: t.cajero ? t.cajero.secuenciaCajero : null,
                usuario_ingresado: t.usuarioIngreso,
                valor: t.valor,
                estado: t.estado === 'S',
                fecha_ingreso: formatDate(t.fechaIngreso),
                fecha_modificacion: t.fechaModificacion ? formatDate(t.fechaModificacion) : null,
                usuario_modificacion: t.usuarioModificacion
            }));

            res.status(200).json({ rows, totalRows });
        } catch (error) {
            next(error);
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

    static async eliminarTransaccion(req: Request, res: Response, next: NextFunction): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { codigoEpago } = req.params;
            const transaccionRepo = queryRunner.manager.getRepository(TransaccionEpago);
            const transaccion = await transaccionRepo.findOneOrFail({ where: { codigoEpago: parseInt(codigoEpago) } });

            // Cambio de estado para eliminación lógica
            transaccion.estado = 'N';
            transaccion.fechaModificacion = new Date();
            transaccion.usuarioModificacion = (req as any).user.userId;

            await transaccionRepo.save(transaccion);
            await queryRunner.commitTransaction();
            res.status(200).json({ mensaje: 'Transacción eliminada lógicamente' });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    }
}