export class CustomerNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerNotFoundError';
  }
}
