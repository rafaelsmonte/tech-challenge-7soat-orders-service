export class Payment {
  private id: number;
  private orderId: string;
  private price: number;
  private pixQrCode: string;
  private pixQrCodeBase64: string;

  constructor(
    id: number,
    orderId: string,
    price: number,
    pixQrCode: string,
    pixQrCodeBase64: string,
  ) {
    this.setId(id);
    this.setOrderId(orderId);
    this.setPrice(price);
    this.setPixQrCode(pixQrCode);
    this.setPixQrCodeBase64(pixQrCodeBase64);
  }

  static new(price: number): Payment {
    return new Payment(0, '', price, '', '');
  }

  // getters
  public getId(): number {
    return this.id;
  }

  public getOrderId(): string {
    return this.orderId;
  }

  public getPrice(): number {
    return this.price;
  }

  public getPixQrCode(): string {
    return this.pixQrCode;
  }

  public getPixQrCodeBase64(): string {
    return this.pixQrCodeBase64;
  }

  // setters
  public setId(id: number): void {
    this.id = id;
  }

  public setOrderId(orderId: string): void {
    this.orderId = orderId;
  }

  public setPrice(price: number): void {
    this.price = price;
  }

  public setPixQrCode(pixQrCode: string): void {
    this.pixQrCode = pixQrCode;
  }

  public setPixQrCodeBase64(pixQrCodeBase64: string): void {
    this.pixQrCodeBase64 = pixQrCodeBase64;
  }
}
