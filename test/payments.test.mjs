import { customer, order, payment } from './utility/exampleData.mjs'
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

describe('payments', async () => {

    describe('POST', async () => {
        let site_id
        let order_id
        let customer_id
        let orderLocal = { ...order }
        let orderResponse
        let paymentLocal = { ...payment }
        before('create customer, jobsite, estimate', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            customerLocal.create_estimate = true
            let res = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
            expect(res.status).to.equal(201)
            orderLocal.customer_id = res.body.customer_id
            orderLocal.site_id = res.body.site_id
            site_id = res.body.site_id
            customer_id = res.body.customer_id

            orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            order_id = orderResponse.body.id
            paymentLocal.order_id = order_id
            console.log(order_id)
            console.log(orderResponse.body)
            expect(orderResponse.status).to.equal(201)

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
                expect(res.status).to.equal(400)
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
                expect(res.status).to.equal(201)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should be visible on the order', async () => {
                let orderResponse = await request.get(`/orders/${order_id}`)
                    .query({ 'payments': 'true' })
                    .auth(username, password)
                expect(orderResponse.body.payments.length).to.equal(1)
                expect(orderResponse.body.payments[0].id).to.equal(res.body.id)
            })
            after('delete payment', async () => {
                await request.delete(`/payments/${res.body.id}`)
            })
        });


        after('delete order, jobsite, customer', async () => {
            await request.delete(`/orders/${order_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/job_sites/${site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {
        let customer_id
        let paymentLocal = { ...payment }
        let site_id
        before('create customer, job site, order', async () => {
            let orderLocal = { ...order }
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            orderLocal.site_id = personResponse.body.site_id
            orderLocal.customer_id = personResponse.body.customer_id
            site_id = personResponse.site_id


            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            expect(orderResponse.status).to.equal(201)

            // add required object references to example data before create
            paymentLocal.order_id = orderResponse.body.id
            customer_id = personResponse.body.customer_id

            let paymentResponse = await request.post('/payments')
                .send(paymentLocal)
                .auth(username, password)
            paymentLocal = paymentResponse.body
            expect(paymentResponse.status).to.equal(201)
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

                // update local reference with successful response body
                paymentLocal = res.body
                expect(res.status).to.equal(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete payment, job_site, customer', async () => {
            await request.delete(`/payments/${paymentLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/orders/${paymentLocal.order_id}`)
                .auth(username, password)
                .expect(200)
            await request.delete(`/job_sites/${site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {
        // get example data
        let paymentLocal = { ...payment }
        let customer_id
        let site_id
        let order_id
        before('create customer, job site, order', async () => {
            let orderLocal = { ...order }
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            orderLocal.site_id = personResponse.body.site_id
            orderLocal.customer_id = personResponse.body.customer_id
            site_id = personResponse.body.site_id


            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            expect(orderResponse.status).to.equal(201)
            order_id = orderResponse.body.id
            console.log(orderResponse.body)

            // add required object references to example data before create
            paymentLocal.order_id = orderResponse.body.id
            customer_id = personResponse.body.customer_id

            let paymentResponse = await request.post('/payments')
                .send(paymentLocal)
                .auth(username, password)
            paymentLocal = paymentResponse.body
            console.log(paymentResponse.body)
            expect(paymentResponse.status).to.equal(201)
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
                res = await request.patch(`/payments/${missing_id}`)
                    .send(paymentLocal)
                    .auth(username, password)
                expect(res.status).to.equal(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let orderLocal = { ...order }
            orderLocal.customer_id = customer_id
            orderLocal.site_id = site_id
            before('create order', async () => {
                let res = await request.post('/orders')
                    .send(orderLocal)
                    .auth(username, password)
                orderLocal.customer_id = res.body.customer_id
                orderLocal.site_id = res.body.site_id
                expect(res.status).to.equal(201)
            })
            let res
            it('should update an payment', async () => {
                res = await request.patch(`/payments/${paymentLocal.id}`)
                    .send({ "order_id": orderLocal.id })
                    .auth(username, password)

                // update local reference with successful response body
                expect(res.status).to.equal(200)



            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update payment', async () => {
                res = await request.get(`/payments/${paymentLocal.id}`)
                    .auth(username, password)
                expect(res.body.order_id).to.equal(orderLocal.id)
                console.log('order_id after PATCH: ' + res.body.site_id)
            })
            after('delete order', async () => {
                await request.delete(`/orders/${orderLocal.id}`)
            })

        })

        after('delete job_site, payment, customer', async () => {
            await request.delete(`/payments/${paymentLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/orders/${order_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/job_sites/${site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
    describe('DELETE', async () => {
        // get example data
        let paymentLocal = { ...payment }
        let customer_id
        let site_id
        let order_id
        before('create customer, job site, order', async () => {
            let orderLocal = { ...order }
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            orderLocal.site_id = personResponse.body.site_id
            orderLocal.customer_id = personResponse.body.customer_id
            site_id = personResponse.site_id


            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            expect(orderResponse.status).to.equal(201)
            order_id = orderResponse.body.id

            // add required object references to example data before create
            paymentLocal.order_id = orderResponse.body.id
            customer_id = personResponse.body.customer_id

            let paymentResponse = await request.post('/payments')
                .send(paymentLocal)
                .auth(username, password)
            paymentLocal = paymentResponse.body
            expect(paymentResponse.status).to.equal(201)
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
                expect(res.status).to.equal(404)
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
                expect(res.status).to.equal(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete job_site, payment, customer', async () => {
            await request.delete(`/payments/${paymentLocal.id}`)
                .auth(username, password)
                .expect(404)

            await request.delete(`/orders/${order_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/job_sites/${site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})