import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Cajero } from "./Cajero";

@Entity({ name: 'FAC_TRANSACCIONES_EPAGO' })
export class TransaccionEpago {
    // Clave primaria generada por secuencia
    @PrimaryGeneratedColumn({
        name: 'CODIGO_EPAGO',
        type: 'number'
    })
    codigoEpago!: number;

    // Fecha de la transacción
    @Column({
        name: 'FECHA_SOLICITUD',
        type: 'timestamp'
    })
    fechaSolicitud!: Date;

    // Relación con Cajero (secuencia_cajero)
    @ManyToOne(() => Cajero)
    @JoinColumn({ name: 'SECUENCIA_CAJERO' }) // Nombre exacto de la columna en FAC_TRANSACCIONES_EPAGO
    cajero!: Cajero;

    // Valor de la transacción
    @Column({
        name: 'VALOR',
        type: 'number'
    })
    valor!: number;

    // Estado (S=Activo, N=Inactivo)
    @Column({
        name: 'ESTADO',
        type: 'varchar2',
        length: 1,
        default: 'S'
    })
    estado!: string;

    // Auditoría: Fecha de ingreso
    @Column({
        name: 'FECHA_INGRESO',
        type: 'timestamp',
        default: () => 'SYSDATE'
    })
    fechaIngreso!: Date;

    // Auditoría: Usuario que creó el registro
    @Column({
        name: 'USUARIO_INGRESO',
        type: 'varchar2',
        length: 50
    })
    usuarioIngreso!: string;

    // Auditoría: Fecha de modificación (nullable)
    @Column({
        name: 'FECHA_MODIFICACION',
        type: 'timestamp',
        nullable: true
    })
    fechaModificacion!: Date | null;

    // Auditoría: Usuario que modificó el registro (nullable)
    @Column({
        name: 'USUARIO_MODIFICACION',
        type: 'varchar2',
        length: 50,
        nullable: true
    })
    usuarioModificacion!: string | null;
}