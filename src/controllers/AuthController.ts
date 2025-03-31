import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { UsuarioSistema } from '../entities/UsuarioSistema';

export class AuthController {
    static async login(req: Request, res: Response): Promise<void> { // Aseguramos que el tipo sea Promise<void>
        const { codigoUsuario, clave } = req.body;

        const user = await AppDataSource.getRepository(UsuarioSistema).findOne({
            where: { codigoUsuario, clave }
        });

        if (!user) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return; // Termina la ejecución de la función
        }

        const token = jwt.sign(
            { userId: user.secuenciaUsuario },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        res.json({ token }); // Enviar respuesta con el token
    }
}
