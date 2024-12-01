import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Order } from '../entities/order.entity';
import { IDatabase } from '../interfaces/database.interface';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from '../errors/database.error';
import { Product } from '../entities/product.entity';

export class DynamoDatabase implements IDatabase {
  private dynamoDBDocClient: DynamoDBDocumentClient;

  constructor() {
    let dynamoClient: DynamoDBClient;

    if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
      dynamoClient = new DynamoDBClient({
        endpoint: 'http://localstack:4566',
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } else {
      dynamoClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }

    this.dynamoDBDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async findAllOrders(): Promise<Order[]> {
    try {
      const params = {
        TableName: 'orders',
      };

      const result = await this.dynamoDBDocClient.send(new ScanCommand(params));

      const orders: Order[] = result.Items.map(
        (order) =>
          new Order(
            order.id,
            new Date(order.createdAt),
            new Date(order.updatedAt),
            order.notes,
            order.trackingId,
            order.totalPrice,
            order.status,
            order.paymentId,
            order.products.map(
              (product) =>
                new Product(
                  product.id,
                  new Date(product.createdAt),
                  new Date(product.updatedAt),
                  product.name,
                  product.price,
                  product.description,
                  product.pictures,
                  product.categoryType,
                  product.quantity,
                ),
            ),
          ),
      );

      return orders;
    } catch (error) {
      console.log(`Database error: ${error}`);
      throw new DatabaseError('Failed to find all orders');
    }
  }

  async findOrderById(id: string): Promise<Order | null> {
    try {
      const params = {
        TableName: 'orders',
        Key: { id },
      };

      const result = await this.dynamoDBDocClient.send(new GetCommand(params));

      if (!result.Item) return null;

      return new Order(
        result.Item.id,
        new Date(result.Item.createdAt),
        new Date(result.Item.updatedAt),
        result.Item.notes,
        result.Item.trackingId,
        result.Item.totalPrice,
        result.Item.status,
        result.Item.paymentId,
        result.Item.products.map(
          (product) =>
            new Product(
              product.id,
              new Date(product.createdAt),
              new Date(product.updatedAt),
              product.name,
              product.price,
              product.description,
              product.pictures,
              product.categoryType,
              product.quantity,
            ),
        ),
      );
    } catch (error) {
      console.log(`Database error: ${error}`);
      throw new DatabaseError('Failed to find an order');
    }
  }

  async createOrder(order: Order): Promise<Order> {
    const orderId = uuidv4();
    const now = new Date().toISOString();

    try {
      const params = {
        TableName: 'orders',
        Item: {
          id: orderId,
          createdAt: now,
          updatedAt: now,
          notes: order.getNotes(),
          trackingId: order.getTrackingId(),
          totalPrice: order.getTotalPrice(),
          status: order.getStatus(),
          paymentId: order.getPaymentId(),
          customerId: order.getCustomerId(),
          products: order.getProducts().map((product) => ({
            id: product.getId(),
            createdAt: now,
            updatedAt: now,
            name: product.getName(),
            price: product.getPrice(),
            description: product.getDescription(),
            pictures: product.getPictures(),
            categoryType: product.getCategoryType(),
            quantity: product.getQuantity(),
          })),
        },
      };

      await this.dynamoDBDocClient.send(new PutCommand(params));

      return this.findOrderById(orderId);
    } catch (error) {
      console.log(`Database error: ${error}`);
      throw new DatabaseError('Failed to create an order');
    }
  }

  async updateOrderStatus(order: Order): Promise<Order> {
    try {
      const newStatus = order.getStatus();

      const params = {
        TableName: 'orders',
        Key: { id: order.getId() },
        UpdateExpression: 'SET #status = :newStatus, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':newStatus': newStatus,
          ':updatedAt': new Date().toISOString(),
        },
      };

      await this.dynamoDBDocClient.send(new UpdateCommand(params));

      return this.findOrderById(order.getId());
    } catch (error) {
      console.log(`Database error: ${error}`);
      throw new DatabaseError('Failed to delete order status');
    }
  }

  async updateOrderPaymentId(
    orderId: string,
    paymentId: number,
  ): Promise<Order> {
    try {
      const params = {
        TableName: 'orders',
        Key: { id: orderId },
        UpdateExpression:
          'SET #paymentId = :paymentId, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#paymentId': 'paymentId',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':paymentId': paymentId,
          ':updatedAt': new Date().toISOString(),
        },
      };

      await this.dynamoDBDocClient.send(new UpdateCommand(params));

      return this.findOrderById(orderId);
    } catch (error) {
      console.log(`Database error: ${error}`);
      throw new DatabaseError('Failed to update an order paymentId');
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      const params = {
        TableName: 'orders',
        Key: {
          id: id,
        },
      };

      await this.dynamoDBDocClient.send(new DeleteCommand(params));
    } catch (error) {
      console.log(`Database error: ${error}`);
      throw new DatabaseError('Failed to delete an order');
    }
  }
}
