export type PaymentMessage = {
  type: string;
  sender: string;
  target: string;
  payload: object;
};
