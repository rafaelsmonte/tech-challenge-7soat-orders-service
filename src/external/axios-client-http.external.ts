import axios, { AxiosInstance } from 'axios';
import { Payment } from 'src/entities/payment.entity';
import { Product } from 'src/entities/product.entity';
import { IClientHttp } from 'src/interfaces/client-http.interface';
import { ProductWithQuantity } from 'src/types/product-with-quantity.type';

export class AxiosClientHttp implements IClientHttp {
  private axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // TODO fix endpoints

  async createPayment(orderId: string, price: number): Promise<Payment> {
    const data = { orderId, price };
    const response = await this.axiosClient.post('v1/payment', data, {
      baseURL: process.env.PAYMENTS_API_BASE_URL,
    });

    const payment: Payment = response.data;

    return payment;
  }

  async reserveProducts(
    productsWithQuantity: ProductWithQuantity[],
  ): Promise<Product[]> {
    const data = { productsWithQuantity };
    const response = await this.axiosClient.post('v1/reserve', data, {
      baseURL: process.env.PRODUCTS_API_BASE_URL,
    });

    const products: Product[] = response.data;

    return products;
  }
}
