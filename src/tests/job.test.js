// noinspection JSUnresolvedFunction,JSUnresolvedVariable,BadExpressionStatementJS

/**
 * Expects the DB has the seed data  "npm run seed"
 *
 * TODO remove hardcoded values and magic numbers
 */

const request = require('supertest');
const app = require('../app');
const Profile = require('../model');
const {createDb, seedDb} = require("../../scripts/seedDb");

describe('Jobs', () => {
    describe('/jobs/unpaid', () => {
        beforeEach(async () => {
            await createDb();
            await seedDb();
        })

        /**
         * 3. ***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor),
         *    for ***active contracts only***.
         *
         * Only 1 unpaid job for profile 6
         */
        it('return unpaid jobs', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '6');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(1);
            expect(body[0].id).toEqual(15);
            expect(body[0].ContractId).toEqual(3);
            expect(body[0].description).toEqual('unpaid work');
            expect(body[0].price).toEqual(222);
            expect(body[0].paid).toEqual(false);
            expect(body[0].paymentDate).toEqual(null);
            expect(body[1]).toBeUndefined();
        });

        /**
         * No unpaid jobs for profile 8
         */
        it('return unpaid jobs if in_progress', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '8');

            expect(statusCode).toEqual(200);
            expect(body).toHaveLength(0);
        });

        /**
         * 3. ***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor),
         *    for ***active contracts only***.
         *
         * Check error code
         */
        it('return {}, profile_id does not exist', async () => {
            const {statusCode, body} = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '199');

            expect(statusCode).toEqual(401);
            expect(body).toEqual({});
        });
    });

    describe('/jobs/:id/pay', () => {
        beforeEach(async () => {
            await createDb();
            await seedDb();
        })

        /**
         * Check error code
         */
        it('return 404 when job is not found', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/33/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(404);
        });

        /**
         * Check error code
         */
        it('return 409 if job is already paid', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/11/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(409);
        });

        /**
         * Check error code
         */
        it('return 400, client has insufficient funds', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/5/pay')
                .set('profile_id', '4');

            expect(statusCode).toEqual(400);
        });

        /**
         * 4. ***POST*** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >=
         *    the amount to pay. The amount should be moved from the client's balance to the contractor balance.
         *
         * Check money transferred
         */
        it('client pays contractor', async () => {
            const {statusCode} = await request(app)
                .post('/jobs/1/pay')
                .set('profile_id', '1');

            expect(statusCode).toEqual(200);

            // here we will go to DB and check that money was moved
            const contractor = await Profile.Profile.findByPk(5);
            const client = await Profile.Profile.findByPk(1);

            expect(client.balance).toEqual(950);
            expect(contractor.balance).toEqual(264);
        });

        /**
         * Fully pay job
         */
        it('mark job as paid', async () => {
            const {statusCode, body} = await request(app)
                .post('/jobs/3/pay')
                .set('profile_id', '2');

            expect(statusCode).toEqual(200);
            expect(body.id).toEqual(3);
            expect(body.ContractId).toEqual(3);
            expect(body.Contract.ContractorId).toEqual(6);
            expect(body.description).toEqual('work');
            expect(body.price).toEqual(202);
            expect(body.paid).toEqual(true);
        });
    });
});
