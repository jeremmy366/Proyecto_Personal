import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: 'DAF_TIPOS_IDENTIFICACION' })
export class TipoIdentificacion {
    // Clave primaria (VARCHAR2)
    @PrimaryColumn({
        name: 'CODIGO_TIPO_IDENTIFICACION',
        type: 'varchar2',
        length: 10
    })
    codigoTipoIdentificacion!: string;

    // Nombre del tipo (ej: "CEDULA")
    @Column({
        name: 'NOMBRE_TIPO_IDENTIFICACION',
        type: 'varchar2',
        length: 50
    })
    nombreTipoIdentificacion!: string;

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