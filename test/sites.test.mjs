import { customer, site } from './utility/exampleData.mjs'
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

describe('sites', async () => {

    describe('POST', async () => {
        let siteLocal = { ...site }
        before('create customer', async () => {
            let customerResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            siteLocal.customer_id = customerResponse.body.id
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/sites')
                    .send(siteLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/sites')
                    .send({ "invalid": "invalid" })
                    .auth(username, password)
                    .expect(400)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('201', async () => {
            let res
            it('should create an site', async () => {
                res = await request.post('/sites')
                    .send(siteLocal)
                    .auth(username, password)
                    .expect(201)
                siteLocal = res.body
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually have created a site', async () => {
                res = await request.get(`/sites/${siteLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
        });


        after('delete site, customer', async () => {
            await request.delete(`/sites/${siteLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${siteLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {

        let siteLocal = { ...site }
        before('create customer, job site', async () => {
            let customerResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            siteLocal.customer_id = customerResponse.body.id

            let siteResponse = await request.post('/sites')
                .send(siteLocal)
                .auth(username, password)
                .expect(201)
            siteLocal = siteResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.get(`/sites/${siteLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to get missing site', async () => {

                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.get(`/sites/${missing_id}`)
                    .auth(username, password)
                    .expect(404)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        describe('200', async () => {
            let res
            it('should get a site', async () => {
                res = await request.get(`/sites/${siteLocal.id}`)
                    .auth(username, password)
                    .expect(200)

                // update local reference with successful response body
                siteLocal = res.body

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete site, customer', async () => {
            await request.delete(`/sites/${siteLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${siteLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {

        let siteLocal = { ...site }
        before('create customer, job site, site', async () => {
            let customerResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            firstCustomerId = customerResponse.body.customer_id
            siteLocal.customer_id = customerResponse.body.id

            let siteResponse = await request.post('/sites')
                .send(siteLocal)
                .auth(username, password)
                .expect(201)
            siteLocal = siteResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.patch(`/sites/${siteLocal.id}`)
                    .send(siteLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.patch(`/sites/${siteLocal.id}`)
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
            it('should fail to update missing site body', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.patch(`/sites/${missing_id}`)
                    .send(siteLocal)
                    .auth(username, password)
                expect(res.status).to.equal(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('200', async () => {
            let res
            it('should update an site', async () => {
                res = await request.patch(`/sites/${siteLocal.id}`)
                    .send({ "project_name": 'updated' })
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update customer_id', async () => {
                res = await request.get(`/sites/${siteLocal.id}`)
                    .auth(username, password)
                    .expect(200)
                expect(res.body.project_name).to.equal('updated')
            })

        })

        after('delete site, customer', async () => {
            await request.delete(`/sites/${siteLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${siteLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('DELETE', async () => {
        let siteLocal = { ...site }
        before('create customer, site', async () => {
            let customerResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            siteLocal.customer_id = customerResponse.body.id

            let siteResponse = await request.post('/sites')
                .send(siteLocal)
                .auth(username, password)
                .expect(201)
            siteLocal = siteResponse.body
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.delete(`/sites/${siteLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to delete a missing site', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.delete(`/sites/${missing_id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let res
            it('should delete an site', async () => {
                res = await request.delete(`/sites/${siteLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete site, customer', async () => {

            await request.delete(`/sites/${siteLocal.id}`)
                .auth(username, password)
                .expect(404)
            await request.delete(`/customers/${siteLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})