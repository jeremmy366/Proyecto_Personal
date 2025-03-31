import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { UsuarioSistema } from "./UsuarioSistema";

@Entity({ name: 'MGM_CAJEROS' })
export class Cajero {
    @PrimaryGeneratedColumn({ name: 'ID_CAJERO' })
    idCajero!: number;

    @ManyToOne(() => UsuarioSistema)
    @JoinColumn({ name: 'CODIGO_USUARIO' })
    usuarioSistema!: UsuarioSistema;

    @Column({ name: 'NOMBRE', length: 100 })
    nombre!: string;

    @Column({ name: 'APELLIDO', length: 100 })
    apellido!: string;

    @Column({ name: 'CODIGO_SUCURSAL', length: 10 })
    codigoSucursal!: string;

    @Column({ name: 'ESTADO', length: 1, default: 'A' })
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
