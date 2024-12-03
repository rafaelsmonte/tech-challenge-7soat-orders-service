import { ProductWithQuantity } from '../types/product-with-quantity.type';
import { OrderGateway } from '../gateways/order.gateway';
import { IDatabase } from '../interfaces/database.interface';
import { OrderUseCases } from '../usecases/order.usecases';
import { OrderAdapter } from '../adapters/order.adapter';
import { ProductGateway } from '../gateways/product.gateway';
import { IClientHttp } from '../interfaces/client-http.interface';
import { PaymentGateway } from '../gateways/payment-gateway';

export class OrderController {
  static async findAll(database: IDatabase): Promise<string> {
    const orderGateway = new OrderGateway(database);

    const orders = await OrderUseCases.findAll(orderGateway);

    return OrderAdapter.adaptArrayJson(orders);
  }

  static async findById(database: IDatabase, id: string): Promise<string> {
    const orderGateway = new OrderGateway(database);

    const ordersDetail = await OrderUseCases.findById(orderGateway, id);

    return OrderAdapter.adaptJson(ordersDetail);
  }

  static async create(
    database: IDatabase,
    clientHttp: IClientHttp,
    notes: string,
    productWithQuantity: ProductWithQuantity[],
    customerId?: string,
  ): Promise<string> {
    const orderGateway = new OrderGateway(database);
    const productGateway = new ProductGateway(clientHttp);
    const paymentGateway = new PaymentGateway(clientHttp);

    const ordersDetailWithPayment = await OrderUseCases.create(
      orderGateway,
      productGateway,
      paymentGateway,
      productWithQuantity,
      notes,
      customerId,
    );

    return OrderAdapter.adaptJsonWithPayment(ordersDetailWithPayment);
  }

  static async delete(database: IDatabase, id: string): Promise<void> {
    const orderGateway = new OrderGateway(database);

    await OrderUseCases.delete(orderGateway, id);
  }

  static async update(
    database: IDatabase,
    id: string,
    status: string,
  ): Promise<string> {
    const orderGateway = new OrderGateway(database);

    const ordersDetail = await OrderUseCases.update(orderGateway, id, status);

    return OrderAdapter.adaptJson(ordersDetail);
  }

  static async updateStatusOnPaymentReceived(
    database: IDatabase,
    orderId: string,
    success: boolean,
  ): Promise<void> {
    const orderGateway = new OrderGateway(database);

    await OrderUseCases.updateStatusOnPaymentReceived(
      orderGateway,
      orderId,
      success,
    );
  }
  //method for testing sonnarqube coverage, should not be merged on main
  static async updateStatusOnPaymentReceived_testing_coverage(
    database: IDatabase,
    orderId: string,
    success: boolean,
  ): Promise<void> {
    const orderGateway = new OrderGateway(database);

    await OrderUseCases.updateStatusOnPaymentReceived(
      orderGateway,
      orderId,
      success,
    );
  }
}
