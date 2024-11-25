import { IClientHttp } from '../interfaces/client-http.interface';
import { Payment } from '../entities/payment.entity';
import { IPaymentGateway } from '../interfaces/payment.gateway.interface';

export class PaymentGateway implements IPaymentGateway {
  constructor(private clientHttp: IClientHttp) {}

  public async create(orderId: string, price: number): Promise<Payment> {
    return this.clientHttp.createPayment(orderId, price);
  }
}
