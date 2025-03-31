import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { TipoIdentificacion } from "./TipoIdentificacion";

@Entity({ name: 'MGM_PACIENTES' })
export class Paciente {
    @PrimaryGeneratedColumn({ name: 'ID_PACIENTE' })
    idPaciente!: number;

    @ManyToOne(() => TipoIdentificacion)
    @JoinColumn({ name: 'CODIGO_TIPO_IDENTIFICACION' })
    tipoIdentificacion!: TipoIdentificacion;

    @Column({ name: 'NUMERO_IDENTIFICACION', length: 20 })
    numeroIdentificacion!: string;

    @Column({ name: 'NOMBRE', length: 100 })
    nombre!: string;

    @Column({ name: 'APELLIDO', length: 100 })
    apellido!: string;

    @Column({ name: 'FECHA_NACIMIENTO' })
    fechaNacimiento!: Date;

    @Column({ name: 'DIRECCION', length: 200 })
    direccion!: string;

    @Column({ name: 'TELEFONO', length: 20 })
    telefono!: string;

    @Column({ name: 'CORREO_ELECTRONICO', length: 100 })
    correoElectronico!: string;

    @Column({ name: 'ESTADO', length: 1, default: 'A' })
    estado!: string;

    @Column({ nullable: true })
    foto?: string;

    // Auditoría
    @Column({ name: 'FECHA_INGRESO' })
    fechaIngreso!: Date;

    @Column({ name: 'USUARIO_INGRESO', length: 20 })
    usuarioIngreso!: string;

    @Column({ name: 'FECHA_MODIFICACION', nullable: true })
    fechaModificacion!: Date | null;

    @Column({ name: 'USUARIO_MODIFICACION', nullable: true, length: 20 })
    usuarioModificacion!: string | null;
}