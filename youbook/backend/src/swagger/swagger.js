const swaggerUi = require("swagger-ui-express")
const swaggereJsdoc = require("swagger-jsdoc")
const path = require('path');
const fs = require('fs');

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "유북 API 명세서",
      description:
        "Node.js Swaager swagger-jsdoc 방식 RestFul API 클라이언트 UI",
    },
    servers: [
      {
        url: "http://localhost:5000", // 요청 URL
      },
    ],
  },
  apis: [path.join(__dirname, '../api/*.js'), path.join(__dirname, '../api/auth/*.js')]
}
const specs = swaggereJsdoc(options)

fs.writeFileSync("./swagger_output.json", JSON.stringify(specs, null, 2), 'utf-8');

module.exports = { swaggerUi, specs }