import { OrderController } from './order.controller';
import { OrderUseCases } from '../usecases/order.usecases';
import { OrderGateway } from '../gateways/order.gateway';
import { ProductGateway } from '../gateways/product.gateway';
import { PaymentGateway } from '../gateways/payment-gateway';
import { IDatabase } from '../interfaces/database.interface';
import { IClientHttp } from '../interfaces/client-http.interface';
import { ProductWithQuantity } from '../types/product-with-quantity.type';
import { OrderAdapter } from '../adapters/order.adapter';

// Mocking dependencies
jest.mock('../usecases/order.usecases');
jest.mock('../gateways/order.gateway');
jest.mock('../gateways/product.gateway');
jest.mock('../gateways/payment-gateway');
jest.mock('../adapters/order.adapter');

describe('OrderController', () => {
  let database: IDatabase;
  let clientHttp: IClientHttp;
  const mockProductWithQuantity: ProductWithQuantity[] = [
    { productId: 1, quantity: 2 },
  ];

  beforeEach(() => {
    // Resetting mocks before each test
    database = {} as IDatabase;
    clientHttp = {} as IClientHttp;

    // Mocking OrderUseCases methods
    (OrderUseCases.findAll as jest.Mock).mockResolvedValue([]);
    (OrderUseCases.findById as jest.Mock).mockResolvedValue(null);
    (OrderUseCases.create as jest.Mock).mockResolvedValue({
      order: { id: '123', notes: 'Test Order' },
      payment: { id: 'PAY123' },
    });
    (OrderUseCases.delete as jest.Mock).mockResolvedValue(undefined);
    (OrderUseCases.update as jest.Mock).mockResolvedValue({
      id: '123',
      status: 'AWAITING',
    });
    (
      OrderUseCases.updateStatusOnPaymentReceived as jest.Mock
    ).mockResolvedValue(undefined);
  });

  describe('findAll', () => {
    it('should return a JSON string with all orders', async () => {
      const mockOrders = [
        {
          id: '1',
          notes: 'Test Order',
          trackingId: 123,
          totalPrice: 100,
          status: 'AWAITING',
          customerId: 'CUST123',
          products: [],
        },
      ];
      (OrderAdapter.adaptArrayJson as jest.Mock).mockReturnValue(
        JSON.stringify(mockOrders),
      );

      const result = await OrderController.findAll(database);

      expect(result).toBe(JSON.stringify(mockOrders));
      expect(OrderUseCases.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return the details of a specific order', async () => {
      const mockOrder = {
        id: '123',
        notes: 'Test Order',
        trackingId: 123456,
        totalPrice: 100,
        status: 'AWAITING',
        customerId: 'CUST123',
        products: [{ id: '1', name: 'Product 1', quantity: 2 }],
      };
      (OrderAdapter.adaptJson as jest.Mock).mockReturnValue(
        JSON.stringify(mockOrder),
      );

      const result = await OrderController.findById(database, '123');

      expect(result).toBe(JSON.stringify(mockOrder));
      expect(OrderUseCases.findById).toHaveBeenCalledWith(
        expect.any(OrderGateway),
        '123',
      );
    });
  });

  describe('create', () => {
    it('should create a new order with payment and return JSON', async () => {
      const mockOrderWithPayment = {
        order: { id: '123', notes: 'Test Order' },
        payment: { id: 'PAY123', pixQrCode: 'PIX123' },
      };
      (OrderAdapter.adaptJsonWithPayment as jest.Mock).mockReturnValue(
        JSON.stringify(mockOrderWithPayment),
      );

      const result = await OrderController.create(
        database,
        clientHttp,
        'Test Order',
        mockProductWithQuantity,
      );

      expect(result).toBe(JSON.stringify(mockOrderWithPayment));
      expect(OrderUseCases.create).toHaveBeenCalledWith(
        expect.any(OrderGateway),
        expect.any(ProductGateway),
        expect.any(PaymentGateway),
        mockProductWithQuantity,
        'Test Order',
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      await OrderController.delete(database, '123');

      expect(OrderUseCases.delete).toHaveBeenCalledWith(
        expect.any(OrderGateway),
        '123',
      );
    });
  });

  describe('update', () => {
    it('should update the status of an order', async () => {
      const updatedOrder = { id: '123', status: 'AWAITING' };
      (OrderAdapter.adaptJson as jest.Mock).mockReturnValue(
        JSON.stringify(updatedOrder),
      );

      const result = await OrderController.update(database, '123', 'AWAITING');

      expect(result).toBe(JSON.stringify(updatedOrder));
      expect(OrderUseCases.update).toHaveBeenCalledWith(
        expect.any(OrderGateway),
        '123',
        'AWAITING',
      );
    });
  });

  describe('updateStatusOnPaymentReceived', () => {
    it('should update the status when payment is received', async () => {
      await OrderController.updateStatusOnPaymentReceived(
        database,
        '123',
        true,
      );

      expect(OrderUseCases.updateStatusOnPaymentReceived).toHaveBeenCalledWith(
        expect.any(OrderGateway),
        '123',
        true,
      );
    });
  });
});
