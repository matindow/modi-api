import { customer, order, payment } from './utility/exampleData.mjs'
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

describe('payments', async () => {

    describe('POST', async () => {
        let orderLocal = { ...order }
        let paymentLocal = { ...payment }
        before('create customer, jobsite', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let res = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)
            orderLocal.customer_id = res.body.id
            orderLocal.site_id = res.body.site_id

            orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
                .expect(201)
            paymentLocal.order_id = order_id
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/payments')
                    .send(payment)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/payments')
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
            it('should create a payment', async () => {
                res = await request.post('/payments')
                    .send(paymentLocal)
                    .auth(username, password)
                    .expect(201)
                paymentLocal = res.body
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should be visible on the order', async () => {
                let orderResponse = await request.get(`/orders/${paymentLocal.order_id}`)
                    .query({ 'payments': 'true' })
                    .auth(username, password)
                    .expect(200)
                expect(orderResponse.body.payments.length).to.equal(1)
                expect(orderResponse.body.payments[0].id).to.equal(paymentLocal.id)
            })
            after('delete payment', async () => {
                await request.delete(`/payments/${paymentLocal.id}`)
                    .expect(200)
            })
        });


        after('delete order, jobsite, customer', async () => {
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
        let paymentLocal = { ...payment }
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

            // add required object references to example data before create
            paymentLocal.order_id = orderLocal.id

            let paymentResponse = await request.post('/payments')
                .send(paymentLocal)
                .auth(username, password)
                .expect(201)
            paymentLocal = paymentResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.get(`/payments/${paymentLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to get missing payment', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.get(`/payments/${missing_id}`)
                    .auth(username, password)
                    .expect(404)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        describe('200', async () => {
            let res
            it('should get an payment', async () => {
                res = await request.get(`/payments/${paymentLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete payment, job_site, customer', async () => {
            await request.delete(`/payments/${paymentLocal.id}`)
                .auth(username, password)
                .expect(200)

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
        let paymentLocal = { ...payment }
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
            // add required object references to example data before create
            paymentLocal.order_id = orderLocal.id

            let paymentResponse = await request.post('/payments')
                .send(paymentLocal)
                .auth(username, password)
                .expect(201)
            paymentLocal = paymentResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.patch(`/payments/${paymentLocal.id}`)
                    .send(paymentLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.patch(`/payments/${paymentLocal.id}`)
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
                res = await request.patch(`/payments/${missing_id}`)
                    .send(paymentLocal)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let res
            it('should update an payment', async () => {
                res = await request.patch(`/payments/${paymentLocal.id}`)
                    .send({ "payment_amount": 500 })
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update payment', async () => {
                res = await request.get(`/payments/${paymentLocal.id}`)
                    .auth(username, password)
                    .expect(200)
                expect(res.body.payment_amount).to.equal(500)
            })
        })

        after('delete job_site, payment, customer', async () => {
            await request.delete(`/payments/${paymentLocal.id}`)
                .auth(username, password)
                .expect(200)

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

        let paymentLocal = { ...payment }
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
            // add required object references to example data before create
            paymentLocal.order_id = orderLocal.id

            let paymentResponse = await request.post('/payments')
                .send(paymentLocal)
                .auth(username, password)
                .expect(201)
            paymentLocal = paymentResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.delete(`/payments/${paymentLocal.id}`)
                    .send(paymentLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to delete missing order body', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.delete(`/payments/${missing_id}`)
                    .send(paymentLocal)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let res
            it('should delete an payment', async () => {
                res = await request.delete(`/payments/${paymentLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete job_site, payment, customer', async () => {
            await request.delete(`/payments/${paymentLocal.id}`)
                .auth(username, password)
                .expect(404)

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
})