export class CreatePaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreatePaymentError';
  }
}
