export class InvalidCustomerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCustomerError';
  }
}
