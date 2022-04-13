import { customer, order } from './utility/exampleData.mjs'
import chai from 'chai';
const { assert, expect } = chai
chai.should()
import 'dotenv/config'
import supertest from 'supertest';
import * as path from 'path';
import chaiResponseValidator from 'chai-openapi-response-validator';

const __dirname = path.resolve();

let username = process.env.MODI_USERNAME
let password = process.env.MODI_PASSWORD
let baseURL = process.env.MODI_BASEURL

let request = supertest(baseURL)

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(__dirname, '/spec/swagger.yaml')))

describe('orders', async () => {

    describe('POST', async () => {
        let orderLocal = { ...order }
        before('create customer, jobsite', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)
            orderLocal.customer_id = customerResponse.body.id
            orderLocal.site_id = customerResponse.body.site_id
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
                    .expect(201)
                orderLocal = res.body
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });


        after('delete order, customer, jobsite', async () => {
            await request.delete(`/orders/${orderLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/sites/${orderLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${orderLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {

        let orderLocal = { ...order }
        before('create customer, job site, order', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            orderLocal.customer_id = customerResponse.body.id
            orderLocal.site_id = customerResponse.body.site_id

            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
                .expect(201)
            orderLocal = orderResponse.body
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

            await request.delete(`/sites/${orderLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${orderLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {
        let orderLocal = { ...order }
        before('create customer, job site, order', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            orderLocal.customer_id = customerResponse.body.id
            orderLocal.site_id = customerResponse.body.site_id

            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
                .expect(201)
            orderLocal = orderResponse.body
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
                    .expect(400)
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
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let res
            it('should update an order', async () => {
                res = await request.patch(`/orders/${orderLocal.id}`)
                    .send({ "status_code": '200' })
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update order', async () => {
                res = await request.get(`/orders/${orderLocal.id}`)
                    .auth(username, password)
                    .expect(200)
                expect(res.body.status_code).to.equal('200')
            })
        })

        after('delete order, customer', async () => {
            await request.delete(`/orders/${orderLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/sites/${orderLocal.site_id}`)
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
            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)
            orderLocal.customer_id = customerResponse.body.id
            orderLocal.site_id = customerResponse.body.site_id

            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
                .expect(201)
            orderLocal = orderResponse.body
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
                    .expect(404)
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
                .expect(404)
            await request.delete(`/sites/${orderLocal.site_id}`)
                .auth(username, password)
                .expect(200)
            await request.delete(`/customers/${orderLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})