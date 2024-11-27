import { Payment } from './payment.entity';

describe('Payment', () => {
    describe('constructor', () => {
        it('should create a valid payment object', () => {
            const payment = new Payment(1, 'order123', 100.0, 'someQrCode', 'base64EncodedString');

            expect(payment.getId()).toBe(1);
            expect(payment.getOrderId()).toBe('order123');
            expect(payment.getPrice()).toBe(100.0);
            expect(payment.getPixQrCode()).toBe('someQrCode');
            expect(payment.getPixQrCodeBase64()).toBe('base64EncodedString');
        });
    });

    describe('new', () => {
        it('should create a new payment with default values except price', () => {
            const price = 150.0;
            const payment = Payment.new(price);

            expect(payment.getId()).toBe(0);
            expect(payment.getOrderId()).toBe('');
            expect(payment.getPrice()).toBe(price);
            expect(payment.getPixQrCode()).toBe('');
            expect(payment.getPixQrCodeBase64()).toBe('');
        });
    });

    describe('setters and getters', () => {
        it('should set and get the payment fields correctly', () => {
            const payment = new Payment(1, 'order123', 100.0, 'someQrCode', 'base64EncodedString');

            // Test setters and getters
            payment.setId(2);
            expect(payment.getId()).toBe(2);

            payment.setOrderId('order456');
            expect(payment.getOrderId()).toBe('order456');

            payment.setPrice(200.0);
            expect(payment.getPrice()).toBe(200.0);

            payment.setPixQrCode('newQrCode');
            expect(payment.getPixQrCode()).toBe('newQrCode');

            payment.setPixQrCodeBase64('newBase64String');
            expect(payment.getPixQrCodeBase64()).toBe('newBase64String');
        });
    });
});
