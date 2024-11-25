const swaggerAutogen = require('swagger-autogen')();

const port = 3000;
const outputFile = './swagger-auto.json';
const routes = ['./index.ts'];

const doc = {
  info: {
    title: 'Orders Service',
    description: '',
  },
  host: `127.0.0.1:${port}`,
};

swaggerAutogen(outputFile, routes, doc);
