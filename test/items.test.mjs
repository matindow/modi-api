import { customer, order, item } from './utility/exampleData.mjs'
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

describe('items', async () => {

    describe('POST', async () => {
        let orderLocal = { ...order }
        before('create customer, jobsite, estimate', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            customerLocal.create_estimate = true
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
                    .expect(400)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('201', async () => {
            describe('order', async () => {
                let itemLocal = { ...item }
                itemLocal.order_id = orderLocal.id
                let itemRes
                it('should create an item', async () => {
                    itemRes = await request.post('/items')
                        .send(itemLocal)
                        .auth(username, password)
                        .expect(201)
                });
                it('should satisfy api spec', () => {
                    itemRes.should.satisfyApiSpec
                })
                it('should be visible on the order', async () => {
                    let orderResponse = await request.get(`/orders/${orderLocal.id}`)
                        .auth(username, password)
                        .expect(200)
                    expect(orderResponse.body.items.length).to.equal(1)
                    expect(orderResponse.body.items[0].id).to.equal(itemRes.body.id)
                })
                after('delete item', async () => {
                    await request.delete(`/items/${itemRes.body.id}`)
                })
            })
            describe('estimate', async () => {
                let itemLocal = { ...item }
                itemLocal.estimate_id = orderLocal.estimate_id
                let itemRes
                it('should create an item', async () => {
                    itemRes = await request.post('/items')
                        .send(itemLocal)
                        .auth(username, password)
                        .expect(201)
                });
                it('should satisfy api spec', () => {
                    itemRes.should.satisfyApiSpec
                })
                it('should be visible on the estimate', async () => {
                    let estimateResponse = await request.get(`/estimates/${orderLocal.estimate_id}`)
                        .auth(username, password)
                        .expect(200)
                    expect(estimateResponse.body.items.length).to.equal(1)
                    expect(estimateResponse.body.items[0].id).to.equal(itemRes.body.id)
                })
                after('delete item', async () => {
                    await request.delete(`/items/${itemRes.body.id}`)
                })
            })
            describe('site', async () => {
                let itemLocal = { ...item }
                itemLocal.site_id = orderLocal.site_id
                let itemRes
                it('should create an item', async () => {
                    itemRes = await request.post('/items')
                        .send(itemLocal)
                        .auth(username, password)
                        .expect(201)
                });
                it('should satisfy api spec', () => {
                    itemRes.should.satisfyApiSpec
                })
                it('should be visible on the site', async () => {
                    let siteResponse = await request.get(`/sites/${orderLocal.site_id}`)
                        .auth(username, password)
                        .expect(200)
                    expect(siteResponse.body.items.length).to.equal(1)
                    expect(siteResponse.body.items[0].id).to.equal(itemRes.body.id)
                })
                after('delete item', async () => {
                    await request.delete(`/items/${itemRes.body.id}`)
                })
            })

        });


        after('delete order, jobsite, estimate, customer', async () => {
            await request.delete(`/orders/${orderLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/estimates/${orderLocal.estimate_id}`)
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
        let itemLocal = { ...item }
        let customerLocal = { ...customer }
        before('create customer, job site', async () => {
            customerLocal.create_job_site = true

            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            itemLocal.site_id = customerResponse.body.site_id

            let itemResponse = await request.post('/items')
                .send(itemLocal)
                .auth(username, password)
                .expect(201)
            itemLocal = itemResponse.body
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
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete item, job_site, customer', async () => {
            await request.delete(`/items/${itemLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/sites/${itemLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customerLocal.id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {

        let itemLocal = { ...item }
        let customerLocal = { ...customer }
        before('create customer, job site', async () => {
            customerLocal.create_job_site = true
            customerLocal.create_estimate = true

            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            itemLocal.site_id = customerResponse.body.site_id
            customerLocal = customerResponse.body

            let itemResponse = await request.post('/items')
                .send(itemLocal)
                .auth(username, password)
                .expect(201)
            itemLocal = itemResponse.body
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
                res = await request.patch(`/items/${missing_id}`)
                    .send(itemLocal)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let res
            it('should update an item', async () => {
                res = await request.patch(`/items/${itemLocal.id}`)
                    .send({ "estimate_id": customerLocal.estimate_id, "site_id": "" })
                    .auth(username, password)
                    .expect(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update item', async () => {
                res = await request.get(`/items/${itemLocal.id}`)
                    .auth(username, password)
                    .expect(200)
                expect(res.body.estimate_id).to.equal(customerLocal.estimate_id)
            })

        })

        after('delete item, estimate, site, customer', async () => {
            await request.delete(`/items/${itemLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/estimates/${customerLocal.estimate_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/sites/${customerLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customerLocal.id}`)
                .auth(username, password)
                .expect(200)
        })
    })
    describe('DELETE', async () => {
        let itemLocal = { ...item }
        let customerLocal = { ...customer }
        before('create customer, job site', async () => {
            customerLocal.create_job_site = true

            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            itemLocal.site_id = customerResponse.body.site_id
            customerLocal = customerResponse.body

            let itemResponse = await request.post('/items')
                .send(itemLocal)
                .auth(username, password)
                .expect(201)
            itemLocal = itemResponse.body
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
                    .expect(404)
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
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete job_site, item, customer', async () => {
            await request.delete(`/items/${itemLocal.id}`)
                .auth(username, password)
                .expect(404)

            await request.delete(`/sites/${customerLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${customerLocal.id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})