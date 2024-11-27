import { PaymentGateway } from './payment-gateway';
import { IClientHttp } from '../interfaces/client-http.interface';
import { Payment } from '../entities/payment.entity';

// Mocking IClientHttp
jest.mock('../interfaces/client-http.interface');

describe('PaymentGateway', () => {
  let clientHttp: IClientHttp;
  let paymentGateway: PaymentGateway;

  beforeEach(() => {
    // Mocking the createPayment method of IClientHttp
    clientHttp = {
      createPayment: jest.fn(),
    } as unknown as IClientHttp;

    paymentGateway = new PaymentGateway(clientHttp);
  });

  describe('create', () => {
    it('should call createPayment and return a payment object', async () => {
      const orderId = '123';
      const price = 100;
      const mockPayment = new Payment(1, orderId, price, 'qr', 'qr64');

      // Mocking the clientHttp.createPayment method to return the mockPayment
      (clientHttp.createPayment as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentGateway.create(orderId, price);

      // Assert that the result matches the mockPayment
      expect(result).toEqual(mockPayment);

      // Assert that createPayment was called once with the correct arguments
      expect(clientHttp.createPayment).toHaveBeenCalledWith(orderId, price);
      expect(clientHttp.createPayment).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if createPayment fails', async () => {
      const orderId = '123';
      const price = 100;

      // Mocking the clientHttp.createPayment method to throw an error
      (clientHttp.createPayment as jest.Mock).mockRejectedValue(new Error('Payment creation failed'));

      // Assert that calling create will throw an error
      await expect(paymentGateway.create(orderId, price)).rejects.toThrow('Payment creation failed');
    });
  });
});
