import { Order } from '../entities/order.entity';

export interface IDatabase {
  // Order
  findAllOrders(): Promise<Order[]>;
  findOrderById(id: string): Promise<Order | null>;
  createOrder(order: Order): Promise<Order>;
  updateOrderStatus(order: Order): Promise<Order>;
  updateOrderPaymentId(orderId: string, paymentId: number): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
}
