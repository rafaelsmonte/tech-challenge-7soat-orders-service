import { ProductGateway } from './product.gateway';
import { IClientHttp } from '../interfaces/client-http.interface';
import { ProductWithQuantity } from 'src/types/product-with-quantity.type';
import { Product } from '../entities/product.entity';

describe('ProductGateway', () => {
  let productGateway: ProductGateway;
  let clientHttpMock: jest.Mocked<IClientHttp>;

  beforeEach(() => {
    // Mock da interface IClientHttp
    clientHttpMock = {
      reserveProducts: jest.fn(),
    } as unknown as jest.Mocked<IClientHttp>;

    // Instância do ProductGateway com o mock
    productGateway = new ProductGateway(clientHttpMock);
  });

  it('should call clientHttp.reserveProducts with correct arguments', async () => {
    // Arrange
    const productsWithQuantity: ProductWithQuantity[] = [
      { productId: 123, quantity: 2 },
      { productId: 456, quantity: 1 },
    ];

    const expectedProducts: Product[] = [
      new Product(1, new Date(), new Date(), 'prod1', 1000, '', [], 'MEAL', 2),
      new Product(2, new Date(), new Date(), 'prod2', 10, '', [], 'MEAL', 2),
    ];

    // Configura o mock para retornar os produtos esperados
    clientHttpMock.reserveProducts.mockResolvedValue(expectedProducts);

    // Act
    const result = await productGateway.reserve(productsWithQuantity);

    // Assert
    expect(clientHttpMock.reserveProducts).toHaveBeenCalledWith(productsWithQuantity);
    expect(result).toEqual(expectedProducts);
  });

  it('should throw an error if clientHttp.reserveProducts fails', async () => {
    // Arrange
    const productsWithQuantity: ProductWithQuantity[] = [
      { productId: 123, quantity: 2 },
    ];
    const errorMessage = 'Failed to reserve products';

    // Configura o mock para lançar um erro
    clientHttpMock.reserveProducts.mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(productGateway.reserve(productsWithQuantity)).rejects.toThrow(errorMessage);
    expect(clientHttpMock.reserveProducts).toHaveBeenCalledWith(productsWithQuantity);
  });
});
