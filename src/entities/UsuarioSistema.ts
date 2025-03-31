import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'DAF_USUARIOS_SISTEMA' })
export class UsuarioSistema {
    // Campo secuencia (clave primaria)
    @PrimaryGeneratedColumn({
        name: 'SECUENCIA_USUARIO',
        type: 'number'
    })
    secuenciaUsuario!: number;

    // Código de usuario (ej: 'VERIS')
    @Column({
        name: 'CODIGO_USUARIO',
        type: 'varchar2',
        length: 50
    })
    codigoUsuario!: string;

    // Correo electrónico
    @Column({
        name: 'CORREO_ELECTRONICO',
        type: 'varchar2',
        length: 100
    })
    correoElectronico!: string;

    // Clave de acceso
    @Column({
        name: 'CLAVE',
        type: 'varchar2',
        length: 100
    })
    clave!: string;

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