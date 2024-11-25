export class InvalidOrderProductError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOrderProductError';
  }
}
