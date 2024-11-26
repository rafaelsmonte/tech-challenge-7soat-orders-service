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

  async createPayment(orderId: string, price: number): Promise<Payment> {
    const data = { orderId, price };
    const response = await this.axiosClient.post('/payment', data, {
      baseURL: process.env.PAYMENTS_API_BASE_URL,
    });

    const payment = new Payment(
      response.data.id,
      response.data.orderId,
      response.data.price,
      response.data.pixQrCode,
      response.data.pixQrCode64,
    );

    return payment;
  }

  async reserveProducts(
    productsWithQuantity: ProductWithQuantity[],
  ): Promise<Product[]> {
    const data = { productsWithQuantity };
    const response = await this.axiosClient.post('/stock/reserve', data, {
      baseURL: process.env.PRODUCTS_API_BASE_URL,
    });

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
          product.categoryType,
          product.quantity,
        ),
    );

    return products;
  }
}
