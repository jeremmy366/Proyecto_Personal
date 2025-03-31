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
    },
    // Asegúrate de que el patrón coincida con las rutas donde están los archivos .ts
    apis: ['./src/routes/*.ts', './src/app.ts'], // Ajusta este patrón si las rutas están en otro lugar
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app: Express) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export { setupSwagger, swaggerSpec };
