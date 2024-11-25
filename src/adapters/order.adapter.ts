import { Order } from '../entities/order.entity';
import { OrderWithPayment } from '../types/order-with-payment.type';

export const OrderAdapter = {
  adaptArrayJson: (orders: Order[]): string => {
    const mappedOrders = orders.map((order) => {
      return {
        id: order.getId(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt(),
        notes: order.getNotes(),
        trackingId: order.getTrackingId(),
        totalPrice: order.getTotalPrice(),
        status: order.getStatus(),
        paymentId: order.getPaymentId(),
        customerId: order.getCustomerId(),
        products: order.getProducts(),
      };
    });

    return JSON.stringify(mappedOrders);
  },

  adaptJson: (order: Order | null): string => {
    if (!order) return JSON.stringify({});

    const mappedOrder = {
      id: order.getId(),
      createdAt: order.getCreatedAt(),
      updatedAt: order.getUpdatedAt(),
      notes: order.getNotes(),
      trackingId: order.getTrackingId(),
      totalPrice: order.getTotalPrice(),
      status: order.getStatus(),
      paymentId: order.getPaymentId(),
      customerId: order.getCustomerId(),
      products: order.getProducts(),
    };

    return JSON.stringify(mappedOrder);
  },

  adaptJsonWithPayment: (orderWithPayment: OrderWithPayment | null): string => {
    if (!orderWithPayment) return JSON.stringify({});

    const { order, payment } = orderWithPayment;

    const mappedOrder = {
      id: order.getId(),
      createdAt: order.getCreatedAt(),
      updatedAt: order.getUpdatedAt(),
      notes: order.getNotes(),
      trackingId: order.getTrackingId(),
      totalPrice: order.getTotalPrice(),
      status: order.getStatus(),
      customerId: order.getCustomerId(),
      products: order.getProducts(),
      payment: {
        id: payment.getId(),
        pixQrCode: payment.getPixQrCode(),
        pixQrCodeBase64: payment.getPixQrCodeBase64(),
      },
    };

    return JSON.stringify(mappedOrder);
  },
};
