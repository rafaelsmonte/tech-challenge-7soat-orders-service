export class ReserveProductsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReserveProductsError';
  }
}
