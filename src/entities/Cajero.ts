import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { UsuarioSistema } from "./UsuarioSistema";

@Entity({ name: 'DAF_CAJEROS' })
export class Cajero {
    // Clave primaria generada por secuencia
    @PrimaryGeneratedColumn({
        name: 'SECUENCIA_CAJERO',
        type: 'number'
    })
    secuenciaCajero!: number;

    // Relación con UsuarioSistema (secuencia_usuario)
    @ManyToOne(() => UsuarioSistema)
    @JoinColumn({ name: 'SECUENCIA_USUARIO' }) // Nombre exacto de la columna
    usuarioSistema!: UsuarioSistema;

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