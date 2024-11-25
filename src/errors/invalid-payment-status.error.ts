export class InvalidPaymentOrderStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPaymentOrderStatusError';
  }
}
