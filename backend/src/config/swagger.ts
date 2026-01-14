import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskMaster API',
            version: '1.0.0',
            description: 'API documentation for the TaskMaster application',
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'jwt',
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.dto.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
