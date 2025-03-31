import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Paciente";
import { Cajero } from "./Cajero";

@Entity({ name: 'FIN_TRANSACCIONES_EPAGO' })
export class TransaccionEpago {
    @PrimaryGeneratedColumn({ name: 'ID_TRANSACCION' })
    idTransaccion!: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: 'ID_PACIENTE' })
    paciente!: Paciente;

    @ManyToOne(() => Cajero)
    @JoinColumn({ name: 'ID_CAJERO' })
    cajero!: Cajero;

    @Column({ name: 'MONTO', type: 'decimal', precision: 10, scale: 2 })
    monto!: number;

    @Column({ name: 'FECHA_TRANSACCION' })
    fechaTransaccion!: Date;

    @Column({ name: 'TIPO_PAGO', length: 20 })
    tipoPago!: string;

    @Column({ name: 'REFERENCIA', length: 50 })
    referencia!: string;

    @Column({ name: 'ESTADO', length: 1, default: 'P' })
    estado!: string;

    @Column({ name: 'FECHA_INGRESO' })
    fechaIngreso!: Date;

    @Column({ name: 'USUARIO_INGRESO', length: 20 })
    usuarioIngreso!: string;

    @Column({ name: 'FECHA_MODIFICACION', nullable: true })
    fechaModificacion!: Date | null;

    @Column({ name: 'USUARIO_MODIFICACION', nullable: true, length: 20 })
    usuarioModificacion!: string | null;
}
