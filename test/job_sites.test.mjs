import { customer, job_site } from './utility/exampleData.mjs'
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

describe('job_sites', async () => {

    describe('POST', async () => {
        let job_siteLocal = { ...job_site }
        let job_siteResponse
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customer)
                .auth(username, password)
            job_siteLocal.customer_id = res.body.customer_id
            expect(res.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/job_sites')
                    .send(job_siteLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/job_sites')
                    .send({ "invalid": "invalid" })
                    .auth(username, password)
                console.log(res)
                expect(res.status).to.equal(400)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('201', async () => {
            let res
            it('should create an job_site', async () => {
                res = await request.post('/job_sites')
                    .send(job_siteLocal)
                    .auth(username, password)
                job_siteResponse = res.body
                expect(res.status).to.equal(201)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });


        after('delete job_site, customer', async () => {
            await request.delete(`/job_sites/${job_siteResponse.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${job_siteResponse.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {
        // get example data
        let job_siteLocal = { ...job_site }
        before('create customer, job site', async () => {
            let personResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            job_siteLocal.customer_id = personResponse.body.customer_id

            let job_siteResponse = await request.post('/job_sites')
                .send(job_siteLocal)
                .auth(username, password)
            job_siteLocal = job_siteResponse.body
            expect(job_siteResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.get(`/job_sites/${job_siteLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to get missing job_site', async () => {

                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.get(`/job_sites/${missing_id}`)
                    .auth(username, password)
                    .expect(404)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        describe('200', async () => {
            let res
            it('should get a job_site', async () => {
                res = await request.get(`/job_sites/${job_siteLocal.id}`)
                    .auth(username, password)

                // update local reference with successful response body
                job_siteLocal = res.body
                expect(res.status).to.equal(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete job_site, customer', async () => {
            await request.delete(`/job_sites/${job_siteLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${job_siteLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {
        // get example data
        let job_siteLocal = { ...job_site }
        let firstCustomerId
        before('create customer, job site, job_site', async () => {
            let personResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            firstCustomerId = personResponse.body.customer_id
            job_siteLocal.customer_id = personResponse.body.customer_id

            let job_siteResponse = await request.post('/job_sites')
                .send(job_siteLocal)
                .auth(username, password)
            job_siteLocal = job_siteResponse.body
            expect(job_siteResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.patch(`/job_sites/${job_siteLocal.id}`)
                    .send(job_siteLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.patch(`/job_sites/${job_siteLocal.id}`)
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
            it('should fail to update missing job_site body', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.patch(`/job_sites/${missing_id}`)
                    .send(job_siteLocal)
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
                expect(res.status).to.equal(201)
                secondCustomer = res.body
            })
            let res
            it('should update an job_site', async () => {
                res = await request.patch(`/job_sites/${job_siteLocal.id}`)
                    .send({ "customer_id": secondCustomer.customer_id })
                    .auth(username, password)

                // update local reference with successful response body
                job_siteLocal = res.body
                expect(res.status).to.equal(200)



            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update customer_id', async () => {
                res = await request.get(`/job_sites/${job_siteLocal.id}`)
                    .auth(username, password)
                expect(res.body.customer_id).to.equal(secondCustomer.customer_id)
            })
            after('delete second customer', async () => {
                await request.patch(`/job_sites/${job_siteLocal.id}`)
                    .send({ "customer_id": firstCustomerId })
                    .auth(username, password)
                await request.delete(`/customers/${secondCustomer.customer_id}`)
            })

        })

        after('delete job_site, customer', async () => {
            await request.delete(`/job_sites/${job_siteLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${job_siteLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('DELETE', async () => {
        let job_siteLocal = { ...job_site }
        before('create customer, job site, job_site', async () => {
            let personResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            job_siteLocal.customer_id = personResponse.body.customer_id

            let job_siteResponse = await request.post('/job_sites')
                .send(job_siteLocal)
                .auth(username, password)
            job_siteLocal = job_siteResponse.body
            expect(job_siteResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.delete(`/job_sites/${job_siteLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to delete a missing job_site', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.delete(`/job_sites/${missing_id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let res
            it('should delete an job_site', async () => {
                res = await request.delete(`/job_sites/${job_siteLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete job_site, customer', async () => {

            await request.delete(`/job_sites/${job_siteLocal.id}`)
                .auth(username, password)
                .expect(404)
            await request.delete(`/customers/${job_siteLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})