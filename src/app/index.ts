import { Request, Response } from 'express';
import promMid from 'express-prometheus-middleware';
import { OrderController } from '../controllers/order.controller';
import { CategoryNotFoundError } from '../errors/category-not-found.error';
import { CustomerNotFoundError } from '../errors/customer-not-found.error';
import { DatabaseError } from '../errors/database.error';
import { InvalidCustomerError } from '../errors/invalid-customer.error';
import { InvalidOrderError } from '../errors/invalid-order.error';
import { InvalidProductError } from '../errors/invalid-product.error';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { IDatabase } from '../interfaces/database.interface';
import { cognitoAuthMiddleware } from './cognito-auth.middleware';
import { IClientHttp } from '../interfaces/client-http.interface';

export class OrdersApp {
  constructor(private database: IDatabase, private clientHttp: IClientHttp) {}

  start() {
    const express = require('express');
    const bodyParser = require('body-parser');
    const swaggerUi = require('swagger-ui-express');

    const port = 3000;
    const app = express();

    app.use(bodyParser.json());

    // Metrics
    app.use(
      promMid({
        metricsPath: '/metrics',
        collectDefaultMetrics: true,
        requestDurationBuckets: [0.1, 0.5, 1, 1.5],
        requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
        responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
      }),
    );

    //Swagger
    const options = require('./swagger.json');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(options));

    // Order endpoints
    app.get('/order', async (request: Request, response: Response) => {
      await OrderController.findAll(this.database)
        .then((orders) => {
          response
            .setHeader('Content-type', 'application/json')
            .status(200)
            .send(orders);
        })
        .catch((error) => this.handleError(error, response));
    });

    app.get('/order/:id', async (request: Request, response: Response) => {
      const id = request.params.id;

      await OrderController.findById(this.database, id)
        .then((order) => {
          response
            .setHeader('Content-type', 'application/json')
            .status(200)
            .send(order);
        })
        .catch((error) => this.handleError(error, response));
    });

    app.post(
      '/order',
      cognitoAuthMiddleware,
      async (request: Request, response: Response) => {
        const { notes, productsWithQuantity } = request.body;
        const customerId = (request as any).accountId;

        await OrderController.create(
          this.database,
          this.clientHttp,
          notes,
          productsWithQuantity,
          customerId,
        )
          .then((order) => {
            response
              .setHeader('Content-type', 'application/json')
              .status(200)
              .send(order);
          })
          .catch((error) => this.handleError(error, response));
      },
    );

    app.delete('/order/:id', async (request: Request, response: Response) => {
      const id = request.params.id;

      await OrderController.delete(this.database, id)
        .then(() => response.status(204).send())
        .catch((error) => this.handleError(error, response));
    });

    app.listen(port, () => {
      console.log(`Tech challenge app listening on port ${port}`);
    });
  }

  handleError(error: Error, response: Response): void {
    if (error instanceof InvalidCustomerError) {
      response.status(400).json({ message: error.message });
    } else if (error instanceof InvalidOrderError) {
      response.status(400).json({ message: error.message });
    } else if (error instanceof InvalidProductError) {
      response.status(400).json({ message: error.message });
    } else if (error instanceof CustomerNotFoundError) {
      response.status(404).json({ message: error.message });
    } else if (error instanceof OrderNotFoundError) {
      response.status(404).json({ message: error.message });
    } else if (error instanceof ProductNotFoundError) {
      response.status(404).json({ message: error.message });
    } else if (error instanceof CategoryNotFoundError) {
      response.status(404).json({ message: error.message });
    } else if (error instanceof DatabaseError) {
      response.status(500).json({ message: error.message });
    } else {
      console.log('An unexpected error has occurred: ' + error);
      response.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
