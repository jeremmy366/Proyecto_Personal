import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Backend',
            version: '1.0.0',
            description: 'Documentación de la API del servidor',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }], // Aplica autenticación globalmente (opcional)
    },
    apis: ['./src/routes/*.ts', './src/app.ts'], // Asegúrate de que las rutas sean correctas
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app: Express) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export { setupSwagger, swaggerSpec };
