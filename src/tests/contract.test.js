// noinspection JSUnresolvedFunction,JSUnresolvedVariable,BadExpressionStatementJS

/**
 * Expects the DB has the seed data  "npm run seed"
 *
 * TODO remove hardcoded values and magic numbers
 */

const request = require('supertest');
const app = require('../app');
const {createDb, seedDb} = require("../../scripts/seedDb");

describe('Contracts', () => {
    /**
     * Get contracts by ID
     */
    describe('/contracts/:id', () => {
        beforeEach(async () => {
            await createDb();
            await seedDb();
        })

        /**
         * Test error codes
         */
        it('return 401 when profile_id does not exist', async () => {
            await request(app)
                .get('/contracts/1')
                .set('profile_id', '199')
                .expect(401);
        });

        /**
         * Test error codes
         */
        it('return 404 when contract not found', async () => {
            await request(app)
                .get('/contracts/199')
                .set('profile_id', '5')
                .expect(404);
        });

        /**
         * Test error codes
         */
        it('return 404 when profile_id mismatch with client or contractor', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/1')
                .set('profile_id', '7');
            expect(statusCode).toEqual(404);
        });

        /**
         * 1. ***GET*** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs
         *    to the profile calling. better fix that!
         *
         * Correct profile (1 client) for contract, only 1 active contract
         */
        it('return contract when profile_id  matches with client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/1')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body).toMatchObject({
                id: 1,
                terms: 'bla bla bla',
                status: 'terminated',
                ClientId: 1,
                ContractorId: 5,
            });
        });

        /**
         * 1. ***GET*** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs
         *    to the profile calling. better fix that!
         *
         * Correct profile (5 contractor) for contract, only 1 active contract
         */
        it('return contract when profile_id  matches with client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/1')
                .set('profile_id', '5');

            expect(statusCode).toEqual(200);
            expect(body).toMatchObject({
                id: 1,
                terms: 'bla bla bla',
                status: 'terminated',
                ClientId: 1,
                ContractorId: 5,
            });
        });

        /**
         * 1. ***GET*** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs
         *    to the profile calling. better fix that!
         *
         * Correct profile (4 client) for contract 7
         */
        it('return contract when profile_id matches with client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts/7')
                .set('profile_id', '4');

            expect(statusCode).toEqual(200);
            expect(body.id).toEqual(7);
        });
    });

    /**
     * Get all active contracts for a profile
     */
    describe('/contracts', () => {
        beforeEach(async () => {
            await createDb();
            await seedDb();
        })

        /**
         * 2. ***GET*** `/contracts` - Returns a list of contracts belonging to a user (client or contractor),
         *    the list should only contain non terminated contracts.
         *
         * Only return active contracts, client 1 has 1 active and 1 terminated contract
         */
        it('return active contracts for the client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(1);
            expect(body[0].id).toEqual(2);
            expect(body[0].ClientId).toEqual(1);
            expect(body[0].ContractorId).toEqual(6);
            expect(body[0].terms).toEqual('bla bla bla');
            expect(body[0].status).toEqual('in_progress');
            expect(body[1]).toBeUndefined();
        });

        /**
         * 2. ***GET*** `/contracts` - Returns a list of contracts belonging to a user (client or contractor),
         *    the list should only contain non terminated contracts.
         *
         * Only return active contracts, client 4 has 3 active contracts
         */
        it('return active contracts for the client', async () => {
            const {statusCode, body} = await request(app)
                .get('/contracts')
                .set('profile_id', '4');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(3);
            expect(body[0].id).toEqual(7);
            expect(body[0].status).toEqual('in_progress');
            expect(body[1].id).toEqual(8);
            expect(body[1].status).toEqual('in_progress');
            expect(body[2].id).toEqual(9);
            expect(body[2].status).toEqual('in_progress');
            expect(body[3]).toBeUndefined();
        });
    });
});
