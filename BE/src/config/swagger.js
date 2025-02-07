import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vaccine System API Documentation',
      version: '1.0.0',
      description: 'API documentation for Vaccine Management System',
      contact: {
        name: 'Your Name',
        email: 'your.email@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID'
            },
            username: {
              type: 'string',
              description: 'User\'s username'
            },
            email: {
              type: 'string',
              description: 'User\'s email address'
            },
            phone: {
              type: 'string',
              description: 'User\'s phone number'
            },
            password: {
              type: 'string',
              description: 'User\'s password (hashed)'
            },
            role: {
              type: 'string',
              enum: ['admin', 'staff', 'customer'],
              description: 'User\'s role in the system'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['username', 'email', 'password', 'role'],
          properties: {
            username: {
              type: 'string',
              example: 'johndoe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            phone: {
              type: 'string',
              example: '0123456789'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['admin', 'staff', 'customer'],
              example: 'customer'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/*.js',
    './src/model/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
