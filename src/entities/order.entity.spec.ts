import { Order } from './order.entity';
import { Product } from './product.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { InvalidOrderError } from '../errors/invalid-order.error';

describe('Order', () => {
    let products: Product[];

    beforeEach(() => {
        // Setup de produtos fictícios para os testes
        products = [
            new Product(1, new Date(), new Date(), 'Product1', 50, 'Sample product', ['https://image-url.com/image1.jpg'], 'MEAL', 2),
            new Product(2, new Date(), new Date(), 'Product1', 50, 'Sample product', ['https://image-url.com/image1.jpg'], 'MEAL', 2),
        ];
    });

    describe('constructor', () => {
        it('should create a valid order', () => {
            const order = new Order(
                '1',
                new Date(),
                new Date(),
                'Test order',
                123456,
                100,
                OrderStatus.AWAITING,
                987654,
                products,
                'CUST123',
            );

            expect(order.getId()).toBe('1');
            expect(order.getNotes()).toBe('Test order');
            expect(order.getTrackingId()).toBe(123456);
            expect(order.getTotalPrice()).toBe(100);
            expect(order.getStatus()).toBe(OrderStatus.AWAITING);
            expect(order.getPaymentId()).toBe(987654);
            expect(order.getProducts()).toEqual(products);
            expect(order.getCustomerId()).toBe('CUST123');
        });
    });

    describe('new', () => {
        it('should create a new order with default values', () => {
            const notes = 'Test new order';
            const trackingId = 123456;
            const totalPrice = 100;
            const status = OrderStatus.AWAITING;
            const paymentId = 987654;

            const order = Order.new(notes, trackingId, totalPrice, status, paymentId, products);

            expect(order.getNotes()).toBe(notes);
            expect(order.getTrackingId()).toBe(trackingId);
            expect(order.getTotalPrice()).toBe(totalPrice);
            expect(order.getStatus()).toBe(status);
            expect(order.getPaymentId()).toBe(paymentId);
            expect(order.getProducts()).toEqual(products);
            expect(order.getCustomerId()).toBeUndefined(); // customerId is optional
        });
    });

    describe('setNotes', () => {
        it('should throw an error if notes length is greater than 50', () => {
            const order = new Order(
                '1',
                new Date(),
                new Date(),
                'Valid order',
                123456,
                100,
                OrderStatus.AWAITING,
                987654,
                products,
            );

            expect(() => order.setNotes('A'.repeat(51))).toThrow(InvalidOrderError);
            expect(() => order.setNotes('A'.repeat(51))).toThrow('Notes size must be lesser than 50');
        });

        it('should allow notes with a length of 50 or less', () => {
            const order = new Order(
                '1',
                new Date(),
                new Date(),
                'Valid order',
                123456,
                100,
                OrderStatus.AWAITING,
                987654,
                products,
            );

            expect(() => order.setNotes('A'.repeat(50))).not.toThrow();
        });
    });

    describe('setStatus', () => {
        it('should throw an error if status is invalid', () => {
            const order = new Order(
                '1',
                new Date(),
                new Date(),
                'Valid order',
                123456,
                100,
                OrderStatus.AWAITING,
                987654,
                products,
            );

            expect(() => order.setStatus('INVALID_STATUS')).toThrow(InvalidOrderError);
            expect(() => order.setStatus('INVALID_STATUS')).toThrow(
                'Status must be AWAITING, IN_PROGRESS, DONE, FINISHED or CANCELLED',
            );
        });

        it('should allow valid status values', () => {
            const order = new Order(
                '1',
                new Date(),
                new Date(),
                'Valid order',
                123456,
                100,
                OrderStatus.AWAITING,
                987654,
                products,
            );

            expect(() => order.setStatus(OrderStatus.FINISHED)).not.toThrow();
            expect(order.getStatus()).toBe(OrderStatus.FINISHED);
        });
    });

    describe('getters and setters', () => {
        it('should correctly get and set the fields', () => {
            const order = new Order(
                '1',
                new Date(),
                new Date(),
                'Test order',
                123456,
                100,
                OrderStatus.AWAITING,
                987654,
                products,
                'CUST123',
            );

            // Test setters and getters
            order.setId('2');
            expect(order.getId()).toBe('2');

            const newDate = new Date();
            order.setCreatedAt(newDate);
            expect(order.getCreatedAt()).toBe(newDate);

            const updatedDate = new Date();
            order.setUpdatedAt(updatedDate);
            expect(order.getUpdatedAt()).toBe(updatedDate);

            order.setNotes('Updated order');
            expect(order.getNotes()).toBe('Updated order');

            order.setTrackingId(654321);
            expect(order.getTrackingId()).toBe(654321);

            order.setTotalPrice(200);
            expect(order.getTotalPrice()).toBe(200);

            order.setPaymentId(123123);
            expect(order.getPaymentId()).toBe(123123);

            order.setCustomerId('CUST456');
            expect(order.getCustomerId()).toBe('CUST456');
        });
    });
});
