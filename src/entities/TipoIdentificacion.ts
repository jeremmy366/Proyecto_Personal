import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'DAF_TIPOS_IDENTIFICACION' })
export class TipoIdentificacion {
    @PrimaryGeneratedColumn({ name: 'CODIGO_TIPO_IDENTIFICACION' })
    codigoTipoIdentificacion!: number;

    @Column({ name: 'DESCRIPCION', length: 50 })
    descripcion!: string;

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
