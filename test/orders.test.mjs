import { customer, order } from './utility/exampleData.mjs'
import { randomString } from './utility/utlity.mjs'
import chai from 'chai';
const { assert, expect } = chai
chai.should()
import 'dotenv/config'
import supertest from 'supertest';
import * as path from 'path';
import chaiResponseValidator from 'chai-openapi-response-validator';
import { chaiPlugin as matchApiSchema } from 'api-contract-validator'

const __dirname = path.resolve();

let username = process.env.MODI_USERNAME
let password = process.env.MODI_PASSWORD
let baseURL = process.env.MODI_BASEURL

let request = supertest(baseURL)

const apiDefinitionsPath = path.join(__dirname, '/spec/swagger.yaml')


// Sets the location of your OpenAPI Specification file
// res.should.satisfyApiSpec
chai.use(chaiResponseValidator.default(path.join(__dirname, '/spec/swagger.yaml')))

// res.should.satisfyApiSpec
// chai.use(matchApiSchema({ apiDefinitionsPath, reportCoverage: true, exportCoverage: true }))

describe('orders', async () => {

    describe('POST', async () => {
        let orderLocal = { ...order }
        let orderResponse
        before('create customer, jobsite', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let res = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
            orderLocal.customer_id = res.body.customer_id
            orderLocal.job_site_id = res.body.job_site_id
            expect(res.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/orders')
                    .send(orderLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/orders')
                    .send({ 'invalid': 'invalid' })
                    .auth(username, password)
                    .expect(400)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('201', async () => {
            let res
            it('should create an order', async () => {
                res = await request.post('/orders')
                    .send(orderLocal)
                    .auth(username, password)
                orderResponse = res.body
                expect(res.status).to.equal(201)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });


        after('delete order, customer, jobsite', async () => {
            await request.delete(`/orders/${orderResponse.id}`)
                .auth(username, password)
                .expect(404)

            await request.delete(`/job_sites/${orderResponse.job_site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${orderResponse.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {
        // get example data
        let orderLocal = { ...order }
        before('create customer, job site, order', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            orderLocal.customer_id = personResponse.body.customer_id
            orderLocal.job_site_id = personResponse.body.job_site_id

            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            orderLocal = orderResponse.body
            expect(orderResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.get(`/orders/${orderLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to get missing order', async () => {

                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.get(`/orders/${missing_id}`)
                    .auth(username, password)
                    .expect(404)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        describe('200', async () => {
            let res
            it('should get an order', async () => {
                res = await request.get(`/orders/${orderLocal.id}`)
                    .auth(username, password)

                // update local reference with successful response body
                orderLocal = res.body
                expect(res.status).to.equal(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete order, customer', async () => {
            await request.delete(`/orders/${orderLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/job_sites/${orderLocal.job_site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${orderLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {
        // get example data
        let orderLocal = { ...order }
        let firstCustomerId
        before('create customer, job site, order', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            firstCustomerId = personResponse.body.customer_id
            orderLocal.customer_id = personResponse.body.customer_id
            orderLocal.job_site_id = personResponse.body.job_site_id

            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            orderLocal = orderResponse.body
            expect(orderResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.patch(`/orders/${orderLocal.id}`)
                    .send(orderLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.patch(`/orders/${orderLocal.id}`)
                    .send({ 'invalid': 'invalid' })
                    .auth(username, password)
                expect(res.status).to.equal(400)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('404', async () => {
            let res
            it('should fail to update missing order body', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.patch(`/orders/${missing_id}`)
                    .send(orderLocal)
                    .auth(username, password)
                expect(res.status).to.equal(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let secondCustomer
            before('create second customer', async () => {
                let customerLocal = { ...customer }
                let res = await request.post('/customers')
                    .send(customerLocal)
                    .auth(username, password)
                orderLocal.customer_id = res.body.customer_id
                orderLocal.job_site_id = res.body.job_site_id
                expect(res.status).to.equal(201)
                secondCustomer = res.body
            })
            let res
            it('should update an order', async () => {
                res = await request.patch(`/orders/${orderLocal.id}`)
                    .send({ "customer_id": secondCustomer.customer_id })
                    .auth(username, password)

                // update local reference with successful response body
                orderLocal = res.body
                expect(res.status).to.equal(200)



            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update customer_id', async () => {
                res = await request.get(`/orders/${orderLocal.id}`)
                    .auth(username, password)
                expect(res.body.customer_id).to.equal(secondCustomer.customer_id)
            })
            after('delete second customer', async () => {
                await request.patch(`/orders/${orderLocal.id}`)
                    .send({ "customer_id": firstCustomerId })
                    .auth(username, password)
                await request.delete(`/customers/${secondCustomer.customer_id}`)
            })

        })

        after('delete order, customer', async () => {
            await request.delete(`/orders/${orderLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/job_sites/${orderLocal.job_site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${orderLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('DELETE', async () => {
        let orderLocal = { ...order }
        before('create customer, job site, order', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)
            orderLocal.customer_id = personResponse.body.customer_id
            orderLocal.job_site_id = personResponse.body.job_site_id

            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            orderLocal = orderResponse.body
            expect(orderResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.delete(`/orders/${orderLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to delete a missing order', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.delete(`/orders/${missing_id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let res
            it('should delete an order', async () => {
                res = await request.delete(`/orders/${orderLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete order, customer', async () => {
            await request.delete(`/orders/${orderLocal.id}`)
                .auth(username, password)
                .expect(200)
            await request.delete(`/job_sites/${orderLocal.job_site_id}`)
                .auth(username, password)
                .expect(200)
            await request.delete(`/customers/${orderLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})