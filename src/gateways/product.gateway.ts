import { ProductWithQuantity } from 'src/types/product-with-quantity.type';
import { Product } from '../entities/product.entity';
import { IProductGateway } from '../interfaces/product.gateway.interface';
import { IClientHttp } from '../interfaces/client-http.interface';

export class ProductGateway implements IProductGateway {
  constructor(private clientHttp: IClientHttp) {}

  public async reserve(
    productsWithQuantity: ProductWithQuantity[],
  ): Promise<Product[]> {
    return this.clientHttp.reserveProducts(productsWithQuantity);
  }
}
