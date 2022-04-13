import { customer, estimate } from './utility/exampleData.mjs'
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

describe('estimates', async () => {

    describe('POST', async () => {
        let estimateLocal = { ...estimate }
        before('create customer, jobsite', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)
            estimateLocal.customer_id = customerResponse.body.id
            estimateLocal.site_id = customerResponse.body.site_id
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/estimates')
                    .send(estimateLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/estimates')
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
            it('should create an estimate', async () => {
                res = await request.post('/estimates')
                    .send(estimateLocal)
                    .auth(username, password)
                    .expect(201)
                estimateLocal = res.body
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually have created an estimate', async () => {
                await request.get(`/estimates/${estimateLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
        });


        after('delete estimate, customer, jobsite', async () => {
            await request.delete(`/estimates/${estimateLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/sites/${estimateLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${estimateLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {
        let estimateLocal = { ...estimate }
        before('create customer, job site, estimate', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true

            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            estimateLocal.customer_id = customerResponse.body.id
            estimateLocal.site_id = customerResponse.body.site_id

            let estimateResponse = await request.post('/estimates')
                .send(estimateLocal)
                .auth(username, password)
                .expect(201)
            estimateLocal = estimateResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.get(`/estimates/${estimateLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to get missing estimate', async () => {

                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.get(`/estimates/${missing_id}`)
                    .auth(username, password)
                    .expect(404)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        describe('200', async () => {
            let res
            it('should get an estimate', async () => {
                res = await request.get(`/estimates/${estimateLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete estimate, customer', async () => {
            await request.delete(`/estimates/${estimateLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/sites/${estimateLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${estimateLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {

        let estimateLocal = { ...estimate }
        let customerLocal = { ...customer }
        before('create customer, job site, estimate', async () => {
            customerLocal.create_job_site = true
            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)

            customerLocal = customerResponse.body
            // add required object references to example data before create
            estimateLocal.customer_id = customerLocal.id
            estimateLocal.site_id = customerLocal.site_id

            let estimateResponse = await request.post('/estimates')
                .send(estimateLocal)
                .auth(username, password)
                .expect(201)
            estimateLocal = estimateResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.patch(`/estimates/${estimateLocal.id}`)
                    .send(estimateLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.patch(`/estimates/${estimateLocal.id}`)
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
            it('should fail to update missing estimate body', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.patch(`/estimates/${missing_id}`)
                    .send(estimateLocal)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let secondCustomer
            before('create second customer', async () => {
                secondCustomer = { ...customer }
                let customerResponse = await request.post('/customers')
                    .send(customerLocal)
                    .auth(username, password)
                    .expect(201)
                secondCustomer = customerResponse.body
            })
            let res
            it('should update an estimate', async () => {
                res = await request.patch(`/estimates/${estimateLocal.id}`)
                    .send({ "customer_id": secondCustomer.id })
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update customer_id', async () => {
                res = await request.get(`/estimates/${estimateLocal.id}`)
                    .auth(username, password)
                expect(res.body.customer_id).to.equal(secondCustomer.id)
            })
            after('delete second customer', async () => {
                await request.patch(`/estimates/${estimateLocal.id}`)
                    .send({ "customer_id": customerLocal.id })
                    .auth(username, password)
                    .expect(200)
                await request.delete(`/customers/${secondCustomer.id}`)
                    .expect(200)
            })

        })

        after('delete estimate, customer', async () => {
            await request.delete(`/estimates/${estimateLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/sites/${estimateLocal.site_id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${estimateLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('DELETE', async () => {
        let estimateLocal = { ...estimate }
        before('create customer, job site, estimate', async () => {
            let customerLocal = { ...customer }
            customerLocal.create_job_site = true
            let customerResponse = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)
            estimateLocal.customer_id = customerResponse.body.id
            estimateLocal.site_id = customerResponse.body.site_id

            let estimateResponse = await request.post('/estimates')
                .send(estimateLocal)
                .auth(username, password)
                .expect(201)
            estimateLocal = estimateResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.delete(`/estimates/${estimateLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to delete a missing estimate', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.delete(`/estimates/${missing_id}`)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let res
            it('should delete an estimate', async () => {
                res = await request.delete(`/estimates/${estimateLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete estimate, customer', async () => {
            await request.delete(`/estimates/${estimateLocal.id}`)
                .auth(username, password)
                .expect(404)
            await request.delete(`/sites/${estimateLocal.site_id}`)
                .auth(username, password)
                .expect(200)
            await request.delete(`/customers/${estimateLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})