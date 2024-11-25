import { OrderStatus } from '../enum/order-status.enum';
import { InvalidOrderError } from '../errors/invalid-order.error';
import { Product } from './product.entity';

export class Order {
  private id: string;
  private createdAt: Date;
  private updatedAt: Date;
  private notes: string;
  private trackingId: number;
  private totalPrice: number;
  private status: OrderStatus;
  private paymentId: number;
  private products: Product[];
  private customerId?: string;

  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    notes: string,
    trackingId: number,
    totalPrice: number,
    status: string,
    paymentId: number,
    products: Product[],
    customerId?: string,
  ) {
    this.setId(id);
    this.setCreatedAt(createdAt);
    this.setUpdatedAt(updatedAt);
    this.setNotes(notes);
    this.setTrackingId(trackingId);
    this.setTotalPrice(totalPrice);
    this.setStatus(status);
    this.setPaymentId(paymentId);
    this.setProducts(products);
    this.setCustomerId(customerId);
  }

  static new(
    notes: string,
    trackingId: number,
    totalPrice: number,
    status: OrderStatus,
    paymentId: number,
    products: Product[],
    customerId?: string,
  ): Order {
    const now = new Date();
    return new Order(
      '',
      now,
      now,
      notes,
      trackingId,
      totalPrice,
      status,
      paymentId,
      products,
      customerId,
    );
  }

  // getters
  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getNotes(): string {
    return this.notes;
  }

  public getTrackingId(): number {
    return this.trackingId;
  }

  public getTotalPrice(): number {
    return this.totalPrice;
  }

  public getStatus(): string {
    return this.status;
  }

  public getPaymentId(): number {
    return this.paymentId;
  }

  public getCustomerId(): string | null {
    return this.customerId;
  }

  public getProducts(): Product[] {
    return this.products;
  }

  // setters
  public setId(id: string): void {
    this.id = id;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  public setNotes(notes: string): void {
    this.notes = notes;

    if (this.notes.length > 50) {
      throw new InvalidOrderError('Notes size must be lesser than 50');
    }
  }

  public setTrackingId(trackingId: number): void {
    this.trackingId = trackingId;
  }

  public setTotalPrice(totalPrice: number): void {
    this.totalPrice = totalPrice;
  }

  public setStatus(status: string): void {
    this.status = OrderStatus[status];

    if (!this.status) {
      throw new InvalidOrderError(
        'Status must be AWAITING, IN_PROGRESS, DONE, FINISHED or CANCELLED',
      );
    }
  }

  public setPaymentId(paymentId: number): void {
    this.paymentId = paymentId;
  }

  public setProducts(products: Product[]): void {
    this.products = products;
  }

  public setCustomerId(customerId: string | null): void {
    this.customerId = customerId;
  }
}
