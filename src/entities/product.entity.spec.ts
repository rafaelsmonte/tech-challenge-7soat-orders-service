import { Product } from './product.entity';
import { InvalidProductError } from '../errors/invalid-product.error';
import { InvalidCategoryError } from '../errors/invalid-category.error';
import { CategoryType } from '../enum/category-type.enum';

describe('Product', () => {
    describe('constructor', () => {
        it('should create a valid product object', () => {
            const product = new Product(
                1,
                new Date(),
                new Date(),
                'Product Name',
                100.0,
                'Product Description',
                ['pic1.jpg', 'pic2.jpg'],
                'MEAL',
                10,
            );

            expect(product.getId()).toBe(1);
            expect(product.getName()).toBe('Product Name');
            expect(product.getPrice()).toBe(100.0);
            expect(product.getDescription()).toBe('Product Description');
            expect(product.getPictures()).toEqual(['pic1.jpg', 'pic2.jpg']);
            expect(product.getCategoryType()).toBe('MEAL');
            expect(product.getQuantity()).toBe(10);
        });
    });

    describe('new', () => {
        it('should create a new product with default id and timestamps', () => {
            const name = 'New Product';
            const price = 50.0;
            const description = 'A new product';
            const pictures = ['pic1.jpg'];
            const categoryType = CategoryType.MEAL;
            const quantity = 5;

            const product = Product.new(name, price, description, pictures, categoryType, quantity);

            expect(product.getId()).toBe(0); // default value for id
            expect(product.getCreatedAt()).toBeInstanceOf(Date);
            expect(product.getUpdatedAt()).toBeInstanceOf(Date);
            expect(product.getName()).toBe(name);
            expect(product.getPrice()).toBe(price);
            expect(product.getDescription()).toBe(description);
            expect(product.getPictures()).toEqual(pictures);
            expect(product.getCategoryType()).toBe(categoryType);
            expect(product.getQuantity()).toBe(quantity);
        });
    });

    describe('setters and getters', () => {
        let product: Product;

        beforeEach(() => {
            product = new Product(
                1,
                new Date(),
                new Date(),
                'Product Name',
                100.0,
                'Product Description',
                ['pic1.jpg', 'pic2.jpg'],
                'MEAL',
                10,
            );
        });

        it('should set and get product name correctly', () => {
            product.setName('Updated Product Name');
            expect(product.getName()).toBe('Updated Product Name');

            expect(() => product.setName('A'.repeat(51))).toThrowError(InvalidProductError);
        });

        it('should set and get product price correctly', () => {
            product.setPrice(200.0);
            expect(product.getPrice()).toBe(200.0);

            expect(() => product.setPrice(0)).toThrowError(InvalidProductError);
            expect(() => product.setPrice(-1)).toThrowError(InvalidProductError);
        });

        it('should set and get product description correctly', () => {
            product.setDescription('Updated Product Description');
            expect(product.getDescription()).toBe('Updated Product Description');

            expect(() => product.setDescription('A'.repeat(51))).toThrowError(InvalidProductError);
        });

        it('should set and get product category type correctly', () => {
            product.setCategoryType('DRINK');
            expect(product.getCategoryType()).toBe('DRINK');

            expect(() => product.setCategoryType('INVALID_CATEGORY')).toThrowError(InvalidCategoryError);
        });

        it('should set and get product quantity correctly', () => {
            product.setQuantity(20);
            expect(product.getQuantity()).toBe(20);
        });
    });
});
