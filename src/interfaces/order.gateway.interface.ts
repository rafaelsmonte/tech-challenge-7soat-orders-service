import { Order } from '../entities/order.entity';

export interface IOrderGateway {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  create(order: Order): Promise<Order>;
  updateStatus(order: Order): Promise<Order>;
  updatePaymentId(orderId: string, paymentId: number): Promise<Order>;
  delete(id: string): Promise<void>;
}
