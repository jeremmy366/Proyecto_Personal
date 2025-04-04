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
}