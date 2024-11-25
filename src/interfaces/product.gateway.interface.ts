import { ProductWithQuantity } from 'src/types/product-with-quantity.type';
import { Product } from '../entities/product.entity';

export interface IProductGateway {
  reserve(productsWithQuantity: ProductWithQuantity[]): Promise<Product[]>;
}
