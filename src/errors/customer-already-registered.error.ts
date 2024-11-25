export class CustomerAlreadyRegisteredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerAlreadyRegisteredError';
  }
}
