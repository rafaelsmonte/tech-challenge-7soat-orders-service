import { OrderAdapter } from './order.adapter';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { OrderWithPayment } from '../types/order-with-payment.type';
import { Payment } from 'src/entities/payment.entity';

const removeTimestamp = (str: string) => str.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '[DATE]');

describe('OrderAdapter', () => {
    // Mock de um produto
    const mockProduct = (): Product =>
        new Product(
            1, // id: número
            new Date(), // createdAt: Data de criação
            new Date(), // updatedAt: Data de atualização
            'Product1', // name: nome do produto
            50.0, // price: preço do produto
            'Sample product', // description: descrição do produto
            ['https://image-url.com/image1.jpg'], // pictures: URLs das imagens
            'MEAL', // categoryType: tipo de categoria
            2 // quantity: quantidade
        );

    // Mock de uma ordem
    const mockOrder = (): Order => {
        return Order.new(
            'Test order',
            123456,
            100.0,
            OrderStatus.AWAITING,
            987654,
            [mockProduct()],
            'CUST123',
        );
    };


    // Mock de um pagamento
    const mockPayment = {
        getId: () => 'PAY123',
        getPixQrCode: () => 'PIX123',
        getPixQrCodeBase64: () => 'BASE64PIX123',
    };

    describe('adaptArrayJson', () => {
        it('should return JSON string for an array of orders', () => {
            const orders = [mockOrder()];
            const result = OrderAdapter.adaptArrayJson(orders);

            const expected = JSON.stringify([
                {
                    "id": "",
                    "createdAt": new Date(),
                    "updatedAt": new Date(),
                    "notes": "Test order",
                    "trackingId": 123456,
                    "totalPrice": 100,
                    "status": "AWAITING",
                    "paymentId": 987654,
                    "customerId": "CUST123",
                    "products": [
                        {
                            "id": 1,
                            "createdAt": new Date(),
                            "updatedAt": new Date(),
                            "name": "Product1",
                            "price": 50,
                            "description": "Sample product",
                            "pictures": [
                                "https://image-url.com/image1.jpg"
                            ],
                            "categoryType": "MEAL",
                            "quantity": 2
                        }
                    ]
                }
            ]);

            expect(removeTimestamp(result)).toEqual(removeTimestamp(expected));
        });
    });

    describe('adaptJson', () => {
        it('should return JSON string for a single order', () => {
            const order = mockOrder();
            const result = OrderAdapter.adaptJson(order);
            const expected = JSON.stringify({
                id: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                notes: 'Test order',
                trackingId: 123456,
                totalPrice: 100.0,
                status: OrderStatus.AWAITING,
                paymentId: 987654,
                customerId: 'CUST123',
                products: [
                    {
                        id: 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        name: 'Product1',
                        price: 50.0,
                        description: 'Sample product',
                        pictures: ['https://image-url.com/image1.jpg'],
                        categoryType: 'MEAL',
                        quantity: 2,
                    },
                ],
            })
            expect(removeTimestamp(result)).toEqual(removeTimestamp(expected));
        });

        describe('adaptJsonWithPayment', () => {
            it('should return JSON string for an order with payment', () => {
                const orderWithPayment = {
                    order: mockOrder(),
                    payment: new Payment(
                        0,
                        'PIX123',
                        100.0,
                        'BASE64PIX123',
                        'PAY123',
                    ),
                };
                const result = OrderAdapter.adaptJsonWithPayment(orderWithPayment);
                const expected = JSON.stringify({
                    id: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    notes: 'Test order',
                    trackingId: 123456,
                    totalPrice: 100.0,
                    status: OrderStatus.AWAITING,
                    customerId: 'CUST123',
                    products: [
                        {
                            id: 1,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            name: 'Product1',
                            price: 50.0,
                            description: 'Sample product',
                            pictures: ['https://image-url.com/image1.jpg'],
                            categoryType: 'MEAL',
                            quantity: 2,
                        },
                    ],
                    payment: {
                        id: 0,
                        pixQrCode: 'BASE64PIX123',
                        pixQrCodeBase64: 'PAY123',
                    },
                })
                expect(removeTimestamp(result)).toEqual(removeTimestamp(expected));


            });
        });
    });
});
