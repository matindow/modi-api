import { customer, order, item } from './utility/exampleData.mjs'
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

describe('items', async () => {

    describe('POST', async () => {
        let site_id
        let estimate_id
        let order_id
        let customer_id
        let orderLocal = { ...order }
        let orderResponse
        before('create customer, jobsite, estimate', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            customerLocal.create_estimate = true
            let res = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
            expect(res.status).to.equal(201)
            orderLocal.customer_id = res.body.customer_id
            orderLocal.job_site_id = res.body.job_site_id
            site_id = res.body.job_site_id
            estimate_id = res.body.estimate_id
            customer_id = res.body.customer_id

            let orderResponse = await request.post('/orders')
                .send(orderLocal)
                .auth(username, password)
            expect(orderResponse.status).to.equal(201)
            order_id = orderResponse.body.id

        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/items')
                    .send(item)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/items')
                    .send({ 'invalid': 'invalid' })
                    .auth(username, password)
                expect(res.status).to.equal(400)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('201', async () => {
            describe('order', async () => {
                let itemLocal = { ...item }
                itemLocal.order_id = order_id
                let res
                it('should create an item', async () => {
                    res = await request.post('/items')
                        .send(itemLocal)
                        .auth(username, password)
                    expect(res.status).to.equal(201)
                });
                it('should satisfy api spec', () => {
                    res.should.satisfyApiSpec
                })
                it('should be visible on the order', async () => {
                    let orderResponse = await request.get(`/orders/${order_id}`)
                        .auth(username, password)
                    expect(orderResponse.body.items.length).to.equal(1)
                    expect(orderResponse.body.items[0].id).to.equal(res.body.id)
                })
                after('delete item', async () => {
                    await request.delete(`/items/${res.body.id}`)
                })
            })
            describe('estimate', async () => {
                let itemLocal = { ...item }
                itemLocal.estimate_id = estimate_id
                let res
                it('should create an item', async () => {
                    res = await request.post('/items')
                        .send(itemLocal)
                        .auth(username, password)
                    expect(res.status).to.equal(201)
                });
                it('should satisfy api spec', () => {
                    res.should.satisfyApiSpec
                })
                it('should be visible on the estimate', async () => {
                    let estimateResponse = await request.get(`/estimates/${estimate_id}`)
                        .auth(username, password)
                    expect(estimateResponse.body.items.length).to.equal(1)
                    expect(estimateResponse.body.items[0].id).to.equal(res.body.id)
                })
                after('delete item', async () => {
                    await request.delete(`/items/${res.body.id}`)
                })
            })
            describe('job_site', async () => {
                let itemLocal = { ...item }
                itemLocal.job_site_id = site_id
                let res
                it('should create an item', async () => {
                    res = await request.post('/items')
                        .send(itemLocal)
                        .auth(username, password)
                    expect(res.status).to.equal(201)
                });
                it('should satisfy api spec', () => {
                    res.should.satisfyApiSpec
                })
                it('should be visible on the job_site', async () => {
                    let job_siteResponse = await request.get(`/job_sites/${site_id}`)
                        .auth(username, password)
                    expect(job_siteResponse.body.items.length).to.equal(1)
                    expect(job_siteResponse.body.items[0].id).to.equal(res.body.id)
                })
                after('delete item', async () => {
                    await request.delete(`/items/${res.body.id}`)
                })
            })

        });


        after('delete order, jobsite, estimate, customer', async () => {
            await request.delete(`/orders/${order_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/estimates/${estimate_id}`)
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
        let itemLocal = { ...item }
        before('create customer, job site', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            itemLocal.job_site_id = personResponse.body.job_site_id
            customer_id = personResponse.body.id

            console.log(itemLocal)
            let itemResponse = await request.post('/items')
                .send(itemLocal)
                .auth(username, password)
            itemLocal = itemResponse.body
            console.log(itemResponse)
            expect(itemResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.get(`/items/${itemLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to get missing item', async () => {

                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.get(`/items/${missing_id}`)
                    .auth(username, password)
                    .expect(404)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        describe('200', async () => {
            let res
            it('should get an item', async () => {
                res = await request.get(`/items/${itemLocal.id}`)
                    .auth(username, password)

                // update local reference with successful response body
                itemLocal = res.body
                expect(res.status).to.equal(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete item, job_site, customer', async () => {
            await request.delete(`/items/${itemLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/job_sites/${itemLocal.job_site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {
        // get example data
        let itemLocal = { ...item }
        let customer_id
        let site_id
        before('create customer, job site', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            itemLocal.job_site_id = personResponse.body.job_site_id
            customer_id = personResponse.body.id
            site_id = personResponse.body.job_site_id

            let itemResponse = await request.post('/items')
                .send(itemLocal)
                .auth(username, password)
            itemLocal = itemResponse.body
            expect(itemResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.patch(`/items/${itemLocal.id}`)
                    .send(itemLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.patch(`/items/${itemLocal.id}`)
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
                res = await request.patch(`/items/${missing_id}`)
                    .send(itemLocal)
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
            orderLocal.job_site_id = site_id
            before('create order', async () => {
                let res = await request.post('/orders')
                    .send(orderLocal)
                    .auth(username, password)
                orderLocal.customer_id = res.body.customer_id
                orderLocal.job_site_id = res.body.job_site_id
                expect(res.status).to.equal(201)
            })
            let res
            it('should update an item', async () => {
                res = await request.patch(`/items/${itemLocal.id}`)
                    .send({ "order_id": orderLocal.id, "site_id": "" })
                    .auth(username, password)

                // update local reference with successful response body
                expect(res.status).to.equal(200)



            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update item', async () => {
                res = await request.get(`/items/${itemLocal.id}`)
                    .auth(username, password)
                expect(res.body.order_id).to.equal(orderLocal.id)
                console.log('site_id after PATCH: ' + res.body.job_site_id)
            })
            after('delete order', async () => {
                await request.delete(`/orders/${orderLocal.id}`)
            })

        })

        after('delete job_site, item, customer', async () => {
            await request.delete(`/items/${itemLocal.id}`)
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
        let itemLocal = { ...item }
        let customer_id
        let site_id
        before('create customer, job site', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let personResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            itemLocal.job_site_id = personResponse.body.job_site_id
            customer_id = personResponse.body.id
            site_id = personResponse.body.job_site_id

            let itemResponse = await request.post('/items')
                .send(itemLocal)
                .auth(username, password)
            itemLocal = itemResponse.body
            expect(itemResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.delete(`/items/${itemLocal.id}`)
                    .send(itemLocal)
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
                res = await request.delete(`/items/${missing_id}`)
                    .send(itemLocal)
                    .auth(username, password)
                expect(res.status).to.equal(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let res
            it('should delete an item', async () => {
                res = await request.delete(`/items/${itemLocal.id}`)
                    .auth(username, password)
                expect(res.status).to.equal(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete job_site, item, customer', async () => {
            await request.delete(`/items/${itemLocal.id}`)
                .auth(username, password)
                .expect(404)

            await request.delete(`/job_sites/${site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})