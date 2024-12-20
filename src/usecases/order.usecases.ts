import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { IOrderGateway } from '../interfaces/order.gateway.interface';
import { ProductWithQuantity } from '../types/product-with-quantity.type';
import { InvalidPaymentOrderStatusError } from '../errors/invalid-payment-status.error';
import { IProductGateway } from '../interfaces/product.gateway.interface';
import { IPaymentGateway } from '../interfaces/payment.gateway.interface';
import { Product } from '../entities/product.entity';
import { OrderWithPayment } from '../types/order-with-payment.type';
import { CategoryType } from '../enum/category-type.enum';
import { Payment } from '../entities/payment.entity';

export class OrderUseCases {
  static async findAll(orderGateway: IOrderGateway): Promise<Order[]> {
    const orders = await orderGateway.findAll();

    const filteredAndSortedOrders = this.filterAndSortOrders(orders);

    return filteredAndSortedOrders;
  }

  static async findById(
    orderGateway: IOrderGateway,
    id: string,
  ): Promise<Order> {
    const order = await orderGateway.findById(id);

    if (!order) throw new OrderNotFoundError('Order not found');

    return order;
  }

  static async create(
    orderGateway: IOrderGateway,
    productGateway: IProductGateway,
    paymentGateway: IPaymentGateway,
    productsWithQuantity: ProductWithQuantity[],
    notes: string,
    customerId?: string,
  ): Promise<OrderWithPayment> {
    const products: Product[] = await productGateway.reserve(
      productsWithQuantity,
    );

    let totalPrice = products.reduce((sum, product) => {
      return sum + product.getPrice() * product.getQuantity();
    }, 0);

    totalPrice = Number(totalPrice.toFixed(2));

    const newOrder = await orderGateway.create(
      Order.new(
        notes,
        0,
        totalPrice,
        OrderStatus.PAYMENT_PENDING,
        0,
        products,
        customerId,
      ),
    );

    let payment: Payment;

    try {
      payment = await paymentGateway.create(newOrder.getId(), totalPrice);
    } catch (error) {
      await orderGateway.delete(newOrder.getId());
      throw error;
    }

    const updateOrder = await orderGateway.updatePaymentId(
      newOrder.getId(),
      payment.getId(),
    );

    return { order: updateOrder, payment };
  }

  static async update(
    orderGateway: IOrderGateway,
    id: string,
    status: string,
  ): Promise<Order> {
    const order = await orderGateway.findById(id);

    if (!order) throw new OrderNotFoundError('Order not found');

    order.setStatus(status);

    const updatedOrder = await orderGateway.updateStatus(order);

    return updatedOrder;
  }

  static async updateStatusOnPaymentReceived(
    orderGateway: IOrderGateway,
    orderId: string,
    success: boolean,
  ): Promise<void> {
    const order = await orderGateway.findById(orderId);

    if (!order) throw new OrderNotFoundError('Order not found');

    if (order.getStatus() != OrderStatus.PAYMENT_PENDING)
      throw new InvalidPaymentOrderStatusError(
        'Order status is not payment pending',
      );

    if (success) {
      order.setStatus(OrderStatus.AWAITING);
    } else {
      order.setStatus(OrderStatus.PAYMENT_FAILED);
    }

    await orderGateway.updateStatus(order);
  }

  static async delete(orderGateway: IOrderGateway, id: string): Promise<void> {
    const order = await orderGateway.findById(id);

    if (!order) throw new OrderNotFoundError('Order not found');

    await orderGateway.delete(id);
  }

  static filterAndSortOrders(orders: Order[]): Order[] {
    const unfinishedOrders = orders.filter(
      (order) => order.getStatus() !== OrderStatus.FINISHED,
    );

    const statusOrder = {
      [OrderStatus.DONE]: 1,
      [OrderStatus.IN_PROGRESS]: 2,
      [OrderStatus.AWAITING]: 3,
    };

    const sortedOrders = unfinishedOrders.sort((a, b) => {
      const statusComparison =
        statusOrder[a.getStatus()] - statusOrder[b.getStatus()];

      if (statusComparison !== 0) return statusComparison;

      return (
        new Date(a.getCreatedAt()).getTime() -
        new Date(b.getCreatedAt()).getTime()
      );
    });

    return sortedOrders;
  }
}
