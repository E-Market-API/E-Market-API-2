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
  },
  apis: ["./routes/*.js"], // <-- files to scan for annotations
};

export default swaggerOptions;