import { mockClient } from 'aws-sdk-client-mock';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDatabase } from './dynamo-database.external';
import { DatabaseError } from '../errors/database.error';

describe('DynamoDatabase', () => {
    const dynamoMock = mockClient(DynamoDBDocumentClient);
    let database: DynamoDatabase;

    beforeEach(() => {
        dynamoMock.reset();
        database = new DynamoDatabase();
    });

    describe('findAllOrders', () => {
        it('should return all orders', async () => {
            dynamoMock.on(ScanCommand).resolves({
                Items: [
                    {
                        id: 'order1',
                        createdAt: '2024-11-01T00:00:00Z',
                        updatedAt: '2024-11-01T01:00:00Z',
                        notes: 'First Order',
                        trackingId: 'TRACK123',
                        totalPrice: 100,
                        status: 'AWAITING',
                        paymentId: 12345,
                        products: [
                            {
                                id: 'product1',
                                createdAt: '2024-11-01T00:00:00Z',
                                updatedAt: '2024-11-01T01:00:00Z',
                                name: 'Product 1',
                                price: 50,
                                description: 'Description 1',
                                pictures: ['pic1.jpg'],
                                categoryType: 'DRINK',
                                quantity: 2,
                            },
                        ],
                    },
                ],
            });

            const orders = await database.findAllOrders();

            expect(orders).toHaveLength(1);
            expect(orders[0].getId()).toBe('order1');
            expect(orders[0].getProducts()).toHaveLength(1);
        });

        it('should throw a DatabaseError on failure', async () => {
            dynamoMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

            await expect(database.findAllOrders()).rejects.toThrow(DatabaseError);
        });
    });
    describe('findOrderById', () => {
        it('should return the order by ID', async () => {
            dynamoMock.on(GetCommand).resolves({
                Item: {
                    id: 'order1',
                    createdAt: '2024-11-01T00:00:00Z',
                    updatedAt: '2024-11-01T01:00:00Z',
                    notes: 'First Order',
                    trackingId: 'TRACK123',
                    totalPrice: 100,
                    status: 'AWAITING',
                    paymentId: 12345,
                    products: [
                        {
                            id: 'product1',
                            createdAt: '2024-11-01T00:00:00Z',
                            updatedAt: '2024-11-01T01:00:00Z',
                            name: 'Product 1',
                            price: 50,
                            description: 'Description 1',
                            pictures: ['pic1.jpg'],
                            categoryType: 'DRINK',
                            quantity: 2,
                        },
                    ],
                },
            });

            const order = await database.findOrderById('order1');

            expect(order).not.toBeNull();
            expect(order?.getId()).toBe('order1');
            expect(order?.getProducts()).toHaveLength(1);
        });

        it('should return null if the order is not found', async () => {
            dynamoMock.on(GetCommand).resolves({});

            const order = await database.findOrderById('order2');

            expect(order).toBeNull();
        });

        it('should throw a DatabaseError on failure', async () => {
            dynamoMock.on(GetCommand).rejects(new Error('DynamoDB error'));

            await expect(database.findOrderById('order1')).rejects.toThrow(DatabaseError);
        });
    });
    describe('createOrder', () => {
        it('should create a new order and return it', async () => {
            const order = {
                getNotes: () => 'Order Notes',
                getTrackingId: () => 'TRACK123',
                getTotalPrice: () => 200,
                getStatus: () => 'AWAITING',
                getPaymentId: () => 12345,
                getCustomerId: () => 1,
                getProducts: () => [
                    {
                        getName: () => 'Product 1',
                        getPrice: () => 100,
                        getDescription: () => 'Product Description',
                        getPictures: () => ['pic1.jpg'],
                        getCategoryType: () => 'DRINK',
                        getQuantity: () => 2,
                        getId: () => '1234321',
                    },
                ],
            };

            // Mock para o PutCommand
            dynamoMock.on(PutCommand).resolves({});
            // Mock para o GetCommand que será chamado internamente
            dynamoMock.on(GetCommand).resolves({
                Item: {
                    id: 'new-order-id',
                    createdAt: '2024-11-01T00:00:00Z',
                    updatedAt: '2024-11-01T01:00:00Z',
                    notes: 'Order Notes',
                    trackingId: 'TRACK123',
                    totalPrice: 200,
                    status: 'AWAITING',
                    paymentId: 12345,
                    products: [
                        {
                            id: 'product1',
                            createdAt: '2024-11-01T00:00:00Z',
                            updatedAt: '2024-11-01T01:00:00Z',
                            name: 'Product 1',
                            price: 100,
                            description: 'Product Description',
                            pictures: ['pic1.jpg'],
                            categoryType: 'DRINK',
                            quantity: 2,
                        },
                    ],
                },
            });

            const createdOrder = await database.createOrder(order as any);

            expect(createdOrder).not.toBeNull();
            expect(createdOrder.getId()).toBe('new-order-id');
            expect(createdOrder.getNotes()).toBe('Order Notes');
        });

        it('should throw a DatabaseError on failure', async () => {
            dynamoMock.on(PutCommand).rejects(new Error('DynamoDB error'));

            const order = {
                getNotes: () => 'Order Notes',
                getTrackingId: () => 'TRACK123',
                getTotalPrice: () => 200,
                getStatus: () => 'AWAITING',
                getPaymentId: () => 12345,
                getProducts: () => [],
            };

            await expect(database.createOrder(order as any)).rejects.toThrow(DatabaseError);
        });
    });
    describe('updateOrderStatus', () => {
        it('should update the order status and return the updated order', async () => {
            // Mock para o UpdateCommand
            dynamoMock.on(UpdateCommand).resolves({});
            // Mock para o GetCommand
            dynamoMock.on(GetCommand).resolves({
                Item: {
                    id: 'order1',
                    createdAt: '2024-11-01T00:00:00Z',
                    updatedAt: '2024-11-01T01:00:00Z',
                    notes: 'First Order',
                    trackingId: 'TRACK123',
                    totalPrice: 100,
                    status: 'AWAITING',
                    paymentId: 12345,
                    products: [],
                },
            });

            const order = {
                getId: () => 'order1',
                getStatus: () => 'AWAITING',
            };

            const updatedOrder = await database.updateOrderStatus(order as any);

            expect(updatedOrder).not.toBeNull();
            expect(updatedOrder.getStatus()).toBe('AWAITING');
        });

        it('should throw a DatabaseError on failure', async () => {
            dynamoMock.on(UpdateCommand).rejects(new Error('DynamoDB error'));

            const order = {
                getId: () => 'order1',
                getStatus: () => 'AWAITING',
            };

            await expect(database.updateOrderStatus(order as any)).rejects.toThrow(DatabaseError);
        });
    });
    describe('updateOrderPaymentId', () => {
        it('should update the paymentId and return the updated order', async () => {
            dynamoMock.on(UpdateCommand).resolves({});
            dynamoMock.on(GetCommand).resolves({
                Item: {
                    id: 'order1',
                    createdAt: '2024-11-01T00:00:00Z',
                    updatedAt: '2024-11-01T01:00:00Z',
                    notes: 'First Order',
                    trackingId: 'TRACK123',
                    totalPrice: 100,
                    status: 'AWAITING',
                    paymentId: 67890,
                    products: [],
                },
            });

            const updatedOrder = await database.updateOrderPaymentId('order1', 67890);

            expect(updatedOrder).not.toBeNull();
            expect(updatedOrder.getPaymentId()).toBe(67890);
        });

        it('should throw a DatabaseError on failure', async () => {
            dynamoMock.on(UpdateCommand).rejects(new Error('DynamoDB error'));

            await expect(database.updateOrderPaymentId('order1', 67890)).rejects.toThrow(DatabaseError);
        });
    });
    describe('deleteOrder', () => {
        it('should delete an order by ID', async () => {
            dynamoMock.on(DeleteCommand).resolves({});

            await expect(database.deleteOrder('order1')).resolves.toBeUndefined();
        });

        it('should throw a DatabaseError on failure', async () => {
            dynamoMock.on(DeleteCommand).rejects(new Error('DynamoDB error'));

            await expect(database.deleteOrder('order1')).rejects.toThrow(DatabaseError);
        });
    });
});
