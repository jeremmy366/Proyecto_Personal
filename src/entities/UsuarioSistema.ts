import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'DAF_USUARIOS_SISTEMA' })
export class UsuarioSistema {
  @PrimaryGeneratedColumn({ name: 'SECUENCIA_USUARIO' })
  secuenciaUsuario!: number;

  @Column({ name: 'CODIGO_USUARIO' })
  codigoUsuario!: string;

  @Column({ name: 'CORREO_ELECTRONICO' })
  correoElectronico!: string;

  @Column({ name: 'CLAVE' })
  clave!: string;

  @Column({ name: 'ESTADO', length: 1 })
  estado!: string;

  // Campos de auditoría
  @Column({ name: 'FECHA_INGRESO' })
  fechaIngreso!: Date;

  @Column({ name: 'USUARIO_INGRESO' })
  usuarioIngreso!: string;

  @Column({ name: 'FECHA_MODIFICACION', nullable: true })
  fechaModificacion!: Date | null;

  @Column({ name: 'USUARIO_MODIFICACION', nullable: true })
  usuarioModificacion!: string | null;
}