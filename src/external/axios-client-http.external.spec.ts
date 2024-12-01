import axios from 'axios';
import { AxiosClientHttp } from './axios-client-http.external';
import { CreatePaymentError } from '../errors/create-payment-error';
import { ReserveProductsError } from '../errors/reserve-products-error';
import { Payment } from '../entities/payment.entity';
import { Product } from '../entities/product.entity';
import { ProductWithQuantity } from '../types/product-with-quantity.type';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AxiosClientHttp', () => {
    let axiosClientHttp: AxiosClientHttp;

    beforeEach(() => {
        // Reset mocks before each test
        mockedAxios.create.mockReturnValue(mockedAxios);
        axiosClientHttp = new AxiosClientHttp();
    });

    describe('createPayment', () => {
        const mockOrderId = 'order-123';
        const mockPrice = 100.50;

        it('should successfully create a payment', async () => {
            // Mock successful API response
            const mockPaymentResponse = {
                data: {
                    id: 'payment-123',
                    orderId: mockOrderId,
                    price: mockPrice,
                    pixQrCode: 'qr-code-string',
                    pixQrCode64: 'base64-qr-code'
                }
            };
            mockedAxios.post.mockResolvedValue(mockPaymentResponse);

            // Set up environment variables
            process.env.PAYMENTS_API_BASE_URL = 'https://payments-api.test';
            process.env.PAYMENTS_API_KEY = 'test-api-key';

            const result = await axiosClientHttp.createPayment(mockOrderId, mockPrice);

            // Assertions
            expect(result).toBeInstanceOf(Payment);
            expect(result.getId()).toBe('payment-123');
            expect(result.getOrderId()).toBe(mockOrderId);
            expect(result.getPrice()).toBe(mockPrice);
            expect(result.getPixQrCode()).toBe('qr-code-string');
            expect(result.getPixQrCodeBase64()).toBe('base64-qr-code');

            // Verify axios call
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/private/payment',
                { orderId: mockOrderId, price: mockPrice },
                {
                    baseURL: 'https://payments-api.test',
                    headers: { 'x-api-key': 'test-api-key' }
                }
            );
        });

        it('should throw CreatePaymentError when payment creation fails', async () => {
            // Mock API error response
            const mockErrorResponse = {
                response: {
                    data: {
                        message: 'Payment creation failed'
                    }
                }
            };
            mockedAxios.post.mockRejectedValue(mockErrorResponse);

            // Set up environment variables
            process.env.PAYMENTS_API_BASE_URL = 'https://payments-api.test';
            process.env.PAYMENTS_API_KEY = 'test-api-key';

            await expect(axiosClientHttp.createPayment(mockOrderId, mockPrice))
                .rejects.toThrow(CreatePaymentError);

            await expect(axiosClientHttp.createPayment(mockOrderId, mockPrice))
                .rejects.toThrow('Payment creation failed');
        });
    });

    describe('reserveProducts', () => {

        const mockProductsWithQuantity: ProductWithQuantity[] = [
            {
                productId: 1,
                quantity: 5
            },
            {
                productId: 2,
                quantity: 3
            }
        ];

        it('should successfully reserve products', async () => {
            // Mock successful API response
            const mockProductsResponse = {
                data: [
                    {
                        id: 'product-1',
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-02T00:00:00Z',
                        name: 'Product 1',
                        price: 50.00,
                        description: 'Description 1',
                        pictures: ['pic1.jpg'],
                        categoryType: 'DRINK',
                        quantity: 2
                    },
                    {
                        id: 'product-2',
                        createdAt: '2023-02-01T00:00:00Z',
                        updatedAt: '2023-02-02T00:00:00Z',
                        name: 'Product 2',
                        price: 75.00,
                        description: 'Description 2',
                        pictures: ['pic2.jpg'],
                        categoryType: 'DRINK',
                        quantity: 1
                    }
                ]
            };
            mockedAxios.post.mockResolvedValue(mockProductsResponse);

            // Set up environment variables
            process.env.PRODUCTS_CATALOG_API_BASE_URL = 'https://products-api.test';
            process.env.PRODUCTS_CATALOG_API_KEY = 'test-product-api-key';

            const result = await axiosClientHttp.reserveProducts(mockProductsWithQuantity);

            // Assertions
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Product);
            expect(result[1]).toBeInstanceOf(Product);

            expect(result[0].getId()).toBe('product-1');
            expect(result[1].getId()).toBe('product-2');

            // Verify axios call
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/private/stock/reserve',
                { productsWithQuantity: mockProductsWithQuantity },
                {
                    baseURL: 'https://products-api.test',
                    headers: { 'x-api-key': 'test-product-api-key' }
                }
            );
        });

        it('should throw ReserveProductsError when product reservation fails', async () => {
            // Mock API error response
            const mockErrorResponse = {
                response: {
                    data: {
                        message: 'Product reservation failed'
                    }
                }
            };
            mockedAxios.post.mockRejectedValue(mockErrorResponse);

            // Set up environment variables
            process.env.PRODUCTS_CATALOG_API_BASE_URL = 'https://products-api.test';
            process.env.PRODUCTS_CATALOG_API_KEY = 'test-product-api-key';

            await expect(axiosClientHttp.reserveProducts(mockProductsWithQuantity))
                .rejects.toThrow(ReserveProductsError);

            await expect(axiosClientHttp.reserveProducts(mockProductsWithQuantity))
                .rejects.toThrow('Product reservation failed');
        });
    });
});