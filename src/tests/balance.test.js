// noinspection JSUnresolvedFunction,JSUnresolvedVariable,BadExpressionStatementJS

/**
 * Expects the DB has the seed data  "npm run seed"
 *
 * TODO remove hardcoded values and magic numbers
 */

const request = require('supertest');
const app = require('../app');
const {createDb, seedDb} = require("../../scripts/seedDb");

describe('Balances', () => {
    describe('/balances/deposit/:userId', () => {
        beforeEach(async () => {
            await createDb();
            await seedDb();
        })

        /**
         * Check for appropriate error
         */
        it('no jobs, so error', async () => {
            const {statusCode, body} = await request(app)
                .post('/balances/deposit/7')
                .send({amount: 50});
            expect(statusCode).toEqual(404);
            expect(body).toEqual(
                expect.objectContaining({})
            );
        });

        /**
         * 5. ***POST*** `/balances/deposit/:userId` - Deposits money into the balance of a client,
         * a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
         *
         * Good deposit
         */
        it('increase clients balance', async () => {
            const {statusCode, body} = await request(app)
                .post('/balances/deposit/2')
                .send({amount: 50});

            expect(statusCode).toEqual(200);
            expect(body.id).toEqual(2);
            expect(body.balance).toEqual(281.11);
        });

        /**
         * 5. ***POST*** `/balances/deposit/:userId` - Deposits money into the balance of a client,
         * a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
         *
         * Excessive deposit fails
         */
        it('returns 400 if deposit exceeds the threshold of 0.25 of unpaid jobs sum', async () => {
            const {statusCode, body} = await request(app)
                .post('/balances/deposit/1')
                .send({amount: 50});

            expect(statusCode).toEqual(400);
            expect(body.error).toEqual('Deposit exceeds the threshold');
        });

        /**
         * Test error code
         */
        it('returns 404 if client is not found', async () => {
            const {statusCode} = await request(app)
                .post('/balances/deposit/12')
                .send({amount: 0});

            expect(statusCode).toEqual(404);
        });

        /**
         * Test error code
         */
        it('returns 404 if user is not a client', async () => {
            const {statusCode} = await request(app)
                .post('/balances/deposit/5')
                .send({amount: 50});

            expect(statusCode).toEqual(404);
        });
    });
});
