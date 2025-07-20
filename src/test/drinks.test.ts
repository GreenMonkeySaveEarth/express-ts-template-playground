import { app } from '../app';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

// Test API key for authentication
const TEST_API_KEY = 'test-api-key-12345';

describe('Drinks API', () => {
    describe('GET /drinks', () => {
        it('should return 400 when search parameter is missing', async () => {
            const response = await request(app)
                .get('/drinks')
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Bad Request');
            expect(response.body).toHaveProperty('message', 'Search parameter is required');
        });

        it('should return drinks when search parameter is provided', async () => {
            const response = await request(app)
                .get('/drinks?search=margarita')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should handle empty search results', async () => {
            const response = await request(app)
                .get('/drinks?search=nonexistentdrink12345')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toEqual([]);
            expect(response.body.total).toBe(0);
        });
    });

    describe('POST /drinks', () => {
        const validDrinkData = {
            name: 'Test Cocktail',
            category: 'Cocktail',
            alcoholic: 'Alcoholic' as const,
            glass: 'Martini Glass',
            instructions: 'Mix all ingredients and serve chilled',
            ingredients: [
                { name: 'Vodka', measure: '2 oz' },
                { name: 'Lime juice', measure: '1 oz' },
            ],
        };

        it('should create a drink with valid data', async () => {
            const response = await request(app)
                .post('/drinks')
                .set('X-API-Key', TEST_API_KEY)
                .send(validDrinkData)
                .expect(201);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Drink created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('name', validDrinkData.name);
            expect(response.body.data).toHaveProperty('createdAt');
        });

        it('should return 401 when API key is missing', async () => {
            const response = await request(app)
                .post('/drinks')
                .send(validDrinkData)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
            expect(response.body).toHaveProperty('message', 'API key is required');
        });

        it('should return 401 when API key is invalid', async () => {
            const response = await request(app)
                .post('/drinks')
                .set('X-API-Key', 'invalid-key')
                .send(validDrinkData)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
            expect(response.body).toHaveProperty('message', 'Invalid API key');
        });

        it('should return 400 when required fields are missing', async () => {
            const invalidData = {
                name: 'Test Cocktail',
                // Missing required fields
            };

            const response = await request(app)
                .post('/drinks')
                .set('X-API-Key', TEST_API_KEY)
                .send(invalidData)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
            expect(response.body).toHaveProperty('details');
            expect(Array.isArray(response.body.details)).toBe(true);
        });

        it('should return 400 when alcoholic field has invalid value', async () => {
            const invalidData = {
                ...validDrinkData,
                alcoholic: 'InvalidValue',
            };

            const response = await request(app)
                .post('/drinks')
                .set('X-API-Key', TEST_API_KEY)
                .send(invalidData)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
        });

        it('should return 400 when ingredients array is empty', async () => {
            const invalidData = {
                ...validDrinkData,
                ingredients: [] as Array<{ name: string; measure?: string }>,
            };

            const response = await request(app)
                .post('/drinks')
                .set('X-API-Key', TEST_API_KEY)
                .send(invalidData)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
        });
    });
});
