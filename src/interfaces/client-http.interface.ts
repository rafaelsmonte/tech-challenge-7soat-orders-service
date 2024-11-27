import { Payment } from '../entities/payment.entity';
import { ProductWithQuantity } from '../types/product-with-quantity.type';
import { Product } from '../entities/product.entity';

export interface IClientHttp {
  // Payment
  createPayment(orderId: string, price: number): Promise<Payment>;

  // Product
  reserveProducts(
    productsWithQuantity: ProductWithQuantity[],
  ): Promise<Product[]>;
}
