import { OrderUseCases } from './order.usecases';
import { IOrderGateway } from '../interfaces/order.gateway.interface';
import { IProductGateway } from 'src/interfaces/product.gateway.interface';
import { IPaymentGateway } from 'src/interfaces/payment.gateway.interface';
import { OrderStatus } from '../enum/order-status.enum';
import { Order } from '../entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Payment } from 'src/entities/payment.entity';
import { CategoryType } from 'src/enum/category-type.enum';
import { InvalidPaymentOrderStatusError } from 'src/errors/invalid-payment-status.error';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { ProductWithQuantity } from 'src/types/product-with-quantity.type';

jest.mock('src/interfaces/order.gateway.interface');
jest.mock('src/interfaces/product.gateway.interface');
jest.mock('src/interfaces/payment.gateway.interface');

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

    const mockProduct = new Product(1, new Date(), new Date(), 'Product 1', 10, 'Description', [], CategoryType.MEAL, 2)
    const mockProduct2 = new Product(2, new Date(), new Date(), 'Product 1', 10, 'Description', [], CategoryType.MEAL, 2)

    it('should fetch all orders and sort them', async () => {
        const orders = [
            new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.IN_PROGRESS, 1, [mockProduct]),
            new Order('2', new Date(), new Date(), 'Order 2', 30, 80, OrderStatus.AWAITING, 2, [mockProduct])
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



    it('should update order status', async () => {
        const order = new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.IN_PROGRESS, 1, [mockProduct]);
        orderGateway.findById = jest.fn().mockResolvedValue(order);
        orderGateway.updateStatus = jest.fn().mockResolvedValue(order);

        const result = await OrderUseCases.update(orderGateway, '1', OrderStatus.FINISHED);

        expect(result.getStatus()).toBe(OrderStatus.FINISHED);
    });



    it('should delete an order', async () => {
        const order = new Order('1', new Date(), new Date(), 'Order 1', 50, 100, OrderStatus.FINISHED, 1, [mockProduct]);
        orderGateway.findById = jest.fn().mockResolvedValue(order);
        orderGateway.delete = jest.fn().mockResolvedValue(undefined);

        await expect(OrderUseCases.delete(orderGateway, '1')).resolves.not.toThrow();
        expect(orderGateway.delete).toHaveBeenCalledTimes(1);
    });
});
