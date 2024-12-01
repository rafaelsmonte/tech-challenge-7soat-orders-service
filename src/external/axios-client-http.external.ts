import axios, { AxiosInstance } from 'axios';
import { Payment } from '../entities/payment.entity';
import { Product } from '../entities/product.entity';
import { CreatePaymentError } from '../errors/create-payment-error';
import { IClientHttp } from '../interfaces/client-http.interface';
import { ProductWithQuantity } from '../types/product-with-quantity.type';
import { ReserveProductsError } from '../errors/reserve-products-error';

export class AxiosClientHttp implements IClientHttp {
  private axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.axiosClient.interceptors.request.use((request) => {
      console.log('Starting Request', JSON.stringify(request, null, 2));
      return request;
    });

    this.axiosClient.interceptors.response.use((response) => {
      console.log('Response:', JSON.stringify(response, null, 2));
      return response;
    });
  }

  async createPayment(orderId: string, price: number): Promise<Payment> {
    const data = { orderId, price };

    console.log(
      'antes de chamar a API para criar payment: ',
      JSON.stringify(data),
    );

    try {
      const response = await this.axiosClient.post('/private/payment', data, {
        baseURL: process.env.PAYMENTS_API_BASE_URL,
        headers: {
          'x-api-key': process.env.PAYMENTS_API_KEY,
        },
      });

      console.log(
        'resposta da API para criar payment: ',
        JSON.stringify(response),
      );

      const payment = new Payment(
        response.data.id,
        response.data.orderId,
        response.data.price,
        response.data.pixQrCode,
        response.data.pixQrCode64,
      );

      console.log('pagamento criado: ', JSON.stringify(payment));

      return payment;
    } catch (error) {
      throw new CreatePaymentError(
        error.response.data.message ||
          'An error has occurred while creating payment',
      );
    }
  }

  async reserveProducts(
    productsWithQuantity: ProductWithQuantity[],
  ): Promise<Product[]> {
    const data = { productsWithQuantity };

    try {
      const response = await this.axiosClient.post(
        '/private/stock/reserve',
        data,
        {
          baseURL: process.env.PRODUCTS_CATALOG_API_BASE_URL,
          headers: {
            'x-api-key': process.env.PRODUCTS_CATALOG_API_KEY,
          },
        },
      );

      console.log('retorno API products: ', JSON.stringify(response));

      const products = response.data.map(
        (product) =>
          new Product(
            product.id,
            product.createdAt,
            product.updatedAt,
            product.name,
            product.price,
            product.description,
            product.pictures,
            product.category.type,
            product.quantity,
          ),
      );

      return products;
    } catch (error) {
      throw new ReserveProductsError(
        error.response.data.message ||
          'An error has occurred while reserving products',
      );
    }
  }
}
