import { Payment } from 'src/entities/payment.entity';
import { ProductWithQuantity } from 'src/types/product-with-quantity.type';
import { Product } from 'src/entities/product.entity';

export interface IClientHttp {
  // Payment
  createPayment(orderId: string, price: number): Promise<Payment>;

  // Product
  reserveProducts(
    productsWithQuantity: ProductWithQuantity[],
  ): Promise<Product[]>;
}
