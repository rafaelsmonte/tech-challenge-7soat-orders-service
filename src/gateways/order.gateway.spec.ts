import { OrderGateway } from './order.gateway';
import { IDatabase } from '../interfaces/database.interface';
import { Order } from '../entities/order.entity';

describe('OrderGateway', () => {
  let orderGateway: OrderGateway;
  let databaseMock: jest.Mocked<IDatabase>;

  beforeEach(() => {
    databaseMock = {
      findAllOrders: jest.fn(),
      findOrderById: jest.fn(),
      createOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
      updateOrderPaymentId: jest.fn(),
      deleteOrder: jest.fn(),
    } as unknown as jest.Mocked<IDatabase>;

    orderGateway = new OrderGateway(databaseMock);
  });

  it('should call database.findAllOrders and return all orders', async () => {
    // Arrange
    const expectedOrders: Order[] = [
      new Order(
        '1', // id
        new Date(),
        new Date(),
        'Order 1',
        12345,
        100.0,
        'AWAITING',
        0,
        [],
        'customer123'
      ),
      new Order(
        '1',
        new Date(),
        new Date(),
        'Order 1',
        12345,
        100.0,
        'AWAITING',
        0,
        [],
        'customer123'
      )
    ];
    databaseMock.findAllOrders.mockResolvedValue(expectedOrders);

    // Act
    const result = await orderGateway.findAll();

    // Assert
    expect(databaseMock.findAllOrders).toHaveBeenCalled();
    expect(result).toEqual(expectedOrders);
  });

  it('should call database.findOrderById and return the order when found', async () => {
    const orderId = '1';
    const expectedOrder = new Order(
      '1',
      new Date(),
      new Date(),
      'Order 1',
      12345,
      100.0,
      'AWAITING',
      0,
      [],
      'customer123'
    );

    databaseMock.findOrderById.mockResolvedValue(expectedOrder);

    // Act
    const result = await orderGateway.findById(orderId);

    // Assert
    expect(databaseMock.findOrderById).toHaveBeenCalledWith(orderId);
    expect(result).toEqual(expectedOrder);
  });

  it('should call database.findOrderById and return null when order not found', async () => {
    // Arrange
    const orderId = 'nonexistent';
    databaseMock.findOrderById.mockResolvedValue(null);

    // Act
    const result = await orderGateway.findById(orderId);

    // Assert
    expect(databaseMock.findOrderById).toHaveBeenCalledWith(orderId);
    expect(result).toBeNull();
  });

  it('should call database.createOrder and return the created order', async () => {
    // Arrange
    const newOrder = new Order(
      '1',
      new Date(),
      new Date(),
      'Order 1',
      12345,
      100.0,
      'AWAITING',
      0,
      [],
      'customer123'
    );

    databaseMock.createOrder.mockResolvedValue(newOrder);

    // Act
    const result = await orderGateway.create(newOrder);

    // Assert
    expect(databaseMock.createOrder).toHaveBeenCalledWith(newOrder);
    expect(result).toEqual(newOrder);
  });

  it('should call database.updateOrderStatus and return the updated order', async () => {
    // Arrange
    const order = new Order(
      '1', // id
      new Date(), // createdAt
      new Date(), // updatedAt
      'Order 1', // notes
      12345, // trackingId
      100.0, // totalPrice
      'AWAITING', // status
      0, // paymentId
      [], // products
      'customer123' // customerId (opcional)
    );
    ;
    databaseMock.updateOrderStatus.mockResolvedValue(order);

    // Act
    const result = await orderGateway.updateStatus(order);

    // Assert
    expect(databaseMock.updateOrderStatus).toHaveBeenCalledWith(order);
    expect(result).toEqual(order);
  });

  it('should call database.updateOrderPaymentId and return the updated order', async () => {
    // Arrange
    const orderId = '1';
    const paymentId = 123;
    const updatedOrder = new Order(
      '1', // id
      new Date(), // createdAt
      new Date(), // updatedAt
      'Order 1', // notes
      12345, // trackingId
      100.0, // totalPrice
      'AWAITING', // status
      0, // paymentId
      [], // products
      'customer123' // customerId (opcional)
    );

    databaseMock.updateOrderPaymentId.mockResolvedValue(updatedOrder);

    // Act
    const result = await orderGateway.updatePaymentId(orderId, paymentId);

    // Assert
    expect(databaseMock.updateOrderPaymentId).toHaveBeenCalledWith(orderId, paymentId);
    expect(result).toEqual(updatedOrder);
  });

  it('should call database.deleteOrder and not return anything', async () => {
    // Arrange
    const orderId = '1';
    databaseMock.deleteOrder.mockResolvedValue();

    // Act
    await orderGateway.delete(orderId);

    // Assert
    expect(databaseMock.deleteOrder).toHaveBeenCalledWith(orderId);
  });

  it('should throw an error if database.deleteOrder fails', async () => {
    // Arrange
    const orderId = '1';
    const errorMessage = 'Delete failed';
    databaseMock.deleteOrder.mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(orderGateway.delete(orderId)).rejects.toThrow(errorMessage);
    expect(databaseMock.deleteOrder).toHaveBeenCalledWith(orderId);
  });
});
