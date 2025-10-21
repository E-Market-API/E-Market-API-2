// config/swagger.js
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Market API",
      version: "1.0.0",
      description: "API documentation for E-Market project",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // tells Swagger it's a JWT
        },
      },
    },
    security: [
      {
        bearerAuth: [], // apply globally to all routes
      },
    ],
  },
  apis: ["./routes/*.js"], // files to scan for route annotations
};

export default swaggerOptions;
