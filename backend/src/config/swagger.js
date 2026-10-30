const swaggerjsdoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Real time chat application api documentations",
      version: "1.0.0",
      description: "API documentation of real time chat application",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Test the API",
      },
    ],
     // JWT Authentication Configuration
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/route/*.js"],
};
const swaggerSpec = swaggerjsdoc(options);
module.exports = swaggerSpec;
