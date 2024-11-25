import { Payment } from '../entities/payment.entity';

export interface IPaymentGateway {
  create(orderId: string, price: number): Promise<Payment>;
}
