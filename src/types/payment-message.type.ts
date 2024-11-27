export type PaymentMessage = {
  type: string;
  sender: string;
  target: string;
  payload: PaymentPayload;
};

type PaymentPayload = {
  orderId: string;
};
