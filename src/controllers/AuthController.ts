import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { UsuarioSistema } from '../entities/UsuarioSistema';
import { Admin } from 'typeorm';

export class AuthController {
    static async login(req: Request, res: Response): Promise<void> { // Aseguramos que el tipo sea Promise<void>
        const { codigoUsuario, clave } = req.body;

        // Buscar el usuario en la base de datos (usando el codigoUsuario)
        const user = await AppDataSource.getRepository(UsuarioSistema).findOne({
            where: { codigoUsuario }
        });

        if (!user || user.clave !== clave) {  // Verifica si la clave es la misma que la almacenada en la base de datos
            res.status(401).json({ error: 'Credenciales inválidas' });
            return; // Termina la ejecución de la función
        }

        // Si el usuario es encontrado y la clave es correcta, genera el token
        const token = jwt.sign(
            { userId: user.secuenciaUsuario, role: 'admin' },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        // Enviar el token al cliente
        res.json({ token });
    }
}
