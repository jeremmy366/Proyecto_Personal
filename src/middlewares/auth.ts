import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];  // Obtener el token

    if (!token) {
        // Enviar un error si no se encuentra el token
        res.status(401).json({ error: 'Token requerido' });
        return;  // Terminar la ejecución aquí, no se llama a next() porque no es válido sin token
    }

    try {
        // Verificar el token usando JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        // Adjuntar la información decodificada al objeto `req`
        (req as any).user = decoded;

        // Continuar con el siguiente middleware/controlador
        next();
    } catch (error) {
        // Si el token no es válido, enviar un error
        res.status(401).json({ error: 'Token inválido' });
        return;  // Terminar la ejecución aquí
    }
};

export const checkRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = (req as any).user.role;

        if (!roles.includes(userRole)) {
            res.status(403).json({ error: 'Acceso no permitido' }); // Si el rol no es permitido, respondemos con un error
            return;  // Terminar la ejecución aquí
        }

        next(); // Si el rol es permitido, continuamos con el siguiente middleware/controlador
    };
};
