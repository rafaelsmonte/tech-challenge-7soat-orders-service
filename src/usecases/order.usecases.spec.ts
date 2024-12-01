import { OrderUseCases } from './order.usecases';
import { IOrderGateway } from '../interfaces/order.gateway.interface';
import { IProductGateway } from '../interfaces/product.gateway.interface';
import { IPaymentGateway } from '../interfaces/payment.gateway.interface';
import { OrderStatus } from '../enum/order-status.enum';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { CategoryType } from '../enum/category-type.enum';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { InvalidPaymentOrderStatusError } from '../errors/invalid-payment-status.error';
import { Payment } from '../entities/payment.entity';
import { OrderWithPayment } from '../types/order-with-payment.type';
import { ProductWithQuantity } from 'src/types/product-with-quantity.type';

jest.mock('../interfaces/order.gateway.interface');
jest.mock('../interfaces/product.gateway.interface');
jest.mock('../interfaces/payment.gateway.interface');

describe('OrderUseCases', () => {
  let orderGateway: jest.Mocked<IOrderGateway>;
  let productGateway: jest.Mocked<IProductGateway>;
  let paymentGateway: jest.Mocked<IPaymentGateway>;

  beforeEach(() => {
    orderGateway = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      updatePaymentId: jest.fn(),
      delete: jest.fn(),
    };
    productGateway = {
      reserve: jest.fn(),
    };
    paymentGateway = {
      create: jest.fn(),
    };
  });

  const mockProduct = new Product(
    1,
    new Date(),
    new Date(),
    'Product 1',
    10,
    'Description',
    [],
    CategoryType.MEAL,
    2,
  );

  it('should fetch all orders and sort them', async () => {
    const orders = [
      new Order(
        '1',
        new Date(),
        new Date(),
        'Order 1',
        50,
        100,
        OrderStatus.IN_PROGRESS,
        1,
        [mockProduct],
      ),
      new Order(
        '2',
        new Date(),
        new Date(),
        'Order 2',
        30,
        80,
        OrderStatus.AWAITING,
        2,
        [mockProduct],
      ),
    ];

    orderGateway.findAll = jest.fn().mockResolvedValue(orders);

    const result = await OrderUseCases.findAll(orderGateway);

    expect(result).toHaveLength(2);
    expect(result[0].getStatus()).toBe(OrderStatus.IN_PROGRESS);
  });

  it('should throw an error if order is not found', async () => {
    orderGateway.findById = jest.fn().mockResolvedValue(null);

    await expect(OrderUseCases.findById(orderGateway, '1')).rejects.toThrowError(OrderNotFoundError);
  });

  it('should create an order and return order with payment', async () => {
    const productsWithQuantity: ProductWithQuantity[] = [{ productId: mockProduct.getId(), quantity: 2 }];
    const notes = 'Test order';
    const customerId = '123';

    productGateway.reserve = jest.fn().mockResolvedValue([mockProduct]);
    orderGateway.create = jest.fn().mockResolvedValue(new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.PAYMENT_PENDING, 1, [mockProduct]));
    paymentGateway.create = jest.fn().mockResolvedValue(new Payment(1, '1', 100, 'pixQrCode', 'pixQrCode64'));
    orderGateway.updatePaymentId = jest.fn().mockResolvedValue(new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.PAYMENT_PENDING, 1, [mockProduct]));

    const result = await OrderUseCases.create(orderGateway, productGateway, paymentGateway, productsWithQuantity, notes, customerId);

    expect(result.order.getId()).toBe('1');
    expect(result.payment.getId()).toBe(1);
  });

  it('should update order status', async () => {
    const order = new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.IN_PROGRESS, 1, [mockProduct]);
    orderGateway.findById = jest.fn().mockResolvedValue(order);
    orderGateway.updateStatus = jest.fn().mockResolvedValue(order);

    const result = await OrderUseCases.update(orderGateway, '1', OrderStatus.FINISHED);

    expect(result.getStatus()).toBe(OrderStatus.FINISHED);
  });

  it('should throw an error if invalid payment status for update on payment received', async () => {
    const order = new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.AWAITING, 1, [mockProduct]);
    orderGateway.findById = jest.fn().mockResolvedValue(order);

    await expect(OrderUseCases.updateStatusOnPaymentReceived(orderGateway, '1', false)).rejects.toThrowError(InvalidPaymentOrderStatusError);
  });

  it('should update order status on payment received', async () => {
    const order = new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.PAYMENT_PENDING, 1, [mockProduct]);
    orderGateway.findById = jest.fn().mockResolvedValue(order);
    orderGateway.updateStatus = jest.fn().mockResolvedValue(order);

    await OrderUseCases.updateStatusOnPaymentReceived(orderGateway, '1', true);

    expect(order.getStatus()).toBe(OrderStatus.AWAITING);
  });

  it('should delete an order', async () => {
    const order = new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.FINISHED, 1, [mockProduct]);
    orderGateway.findById = jest.fn().mockResolvedValue(order);
    orderGateway.delete = jest.fn().mockResolvedValue(undefined);

    await expect(OrderUseCases.delete(orderGateway, '1')).resolves.not.toThrow();
    expect(orderGateway.delete).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if order not found for delete', async () => {
    orderGateway.findById = jest.fn().mockResolvedValue(null);

    await expect(OrderUseCases.delete(orderGateway, '1')).rejects.toThrowError(OrderNotFoundError);
  });

  it('should filter and sort orders correctly', () => {
    const orders = [
      new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.IN_PROGRESS, 1, [mockProduct]),
      new Order('2', new Date(), new Date(), 'Order 2', 30, 80, OrderStatus.AWAITING, 2, [mockProduct]),
    ];

    const sortedOrders = OrderUseCases.filterAndSortOrders(orders);

    expect(sortedOrders[0].getStatus()).toBe(OrderStatus.IN_PROGRESS);
  });
});
