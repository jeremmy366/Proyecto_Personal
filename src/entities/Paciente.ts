import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { TipoIdentificacion } from "./TipoIdentificacion";

@Entity({ name: 'MGM_PACIENTES' })
export class Paciente {
    // Clave primaria generada por secuencia
    @PrimaryGeneratedColumn({
        name: 'ID_PACIENTE',
        type: 'number',
    })
    idPaciente!: number;

    // Relación con TipoIdentificacion
    @ManyToOne(() => TipoIdentificacion)
    @JoinColumn({ name: 'CODIGO_TIPO_IDENTIFICACION' })
    tipoIdentificacion!: TipoIdentificacion;

    // Número de identificación (ej: "0999999999")
    @Column({
        name: 'NUMERO_IDENTIFICACION',
        type: 'varchar2',
        length: 20
    })
    numeroIdentificacion!: string;

    // Campos de nombres y apellidos
    @Column({
        name: 'PRIMER_NOMBRE',
        type: 'varchar2',
        length: 50
    })
    primerNombre!: string;

    @Column({
        name: 'SEGUNDO_NOMBRE',
        type: 'varchar2',
        length: 50,
        nullable: true
    })
    segundoNombre?: string;

    @Column({
        name: 'PRIMER_APELLIDO',
        type: 'varchar2',
        length: 50
    })
    primerApellido!: string;

    @Column({
        name: 'SEGUNDO_APELLIDO',
        type: 'varchar2',
        length: 50,
        nullable: true
    })
    segundoApellido?: string;

    // Nombre completo (calculado o almacenado)
    @Column({
        name: 'NOMBRE_COMPLETO',
        type: 'varchar2',
        length: 200
    })
    nombreCompleto!: string;

    // Correo electrónico
    @Column({
        name: 'EMAIL',
        type: 'varchar2',
        length: 100,
        nullable: true
    })
    email?: string;

    // Ruta de la foto (ej: "/uploads/foto.jpg")
    @Column({
        name: 'RUTA_FOTO',
        type: 'varchar2',
        length: 200,
        nullable: true
    })
    rutaFoto?: string;

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