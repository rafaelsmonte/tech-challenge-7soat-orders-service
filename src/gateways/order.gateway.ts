import { Order } from '../entities/order.entity';
import { IDatabase } from '../interfaces/database.interface';
import { IOrderGateway } from '../interfaces/order.gateway.interface';

export class OrderGateway implements IOrderGateway {
  constructor(private database: IDatabase) {}

  async findAll(): Promise<Order[]> {
    return this.database.findAllOrders();
  }

  async findById(id: string): Promise<Order | null> {
    return this.database.findOrderById(id);
  }

  async create(order: Order): Promise<Order> {
    return this.database.createOrder(order);
  }

  async updateStatus(order: Order): Promise<Order> {
    return this.database.updateOrderStatus(order);
  }

  async updatePaymentId(orderId: string, paymentId: number): Promise<Order> {
    return this.database.updateOrderPaymentId(orderId, paymentId);
  }

  async delete(id: string): Promise<void> {
    return this.database.deleteOrder(id);
  }
}
