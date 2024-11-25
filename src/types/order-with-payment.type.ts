import { Order } from '../entities/order.entity';
import { Payment } from '../entities/payment.entity';

export type OrderWithPayment = {
  order: Order;
  payment: Payment;
};
