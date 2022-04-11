import { customer, address } from './utility/exampleData.mjs'
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

describe('addresses', async () => {

    describe('POST', async () => {
        let addressLocal = { ...address }
        let addressResponse
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customer)
                .auth(username, password)
            addressLocal.customer_id = res.body.customer_id
            expect(res.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/addresses')
                    .send(addressLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/addresses')
                    .send({ "invalid": "invalid" })
                    .auth(username, password)
                expect(res.status).to.equal(400)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('201', async () => {
            let res
            it('should create an address', async () => {
                res = await request.post('/addresses')
                    .send(addressLocal)
                    .auth(username, password)
                addressResponse = res.body
                expect(res.status).to.equal(201)
            });
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });


        after('delete address, customer', async () => {
            await request.delete(`/addresses/${addressResponse.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${addressResponse.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {
        // get example data
        let addressLocal = { ...address }
        before('create customer, job site', async () => {
            let personResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            addressLocal.customer_id = personResponse.body.customer_id

            let addressResponse = await request.post('/addresses')
                .send(addressLocal)
                .auth(username, password)
            addressLocal = addressResponse.body
            expect(addressResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.get(`/addresses/${addressLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to get missing address', async () => {

                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.get(`/addresses/${missing_id}`)
                    .auth(username, password)
                    .expect(404)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        describe('200', async () => {
            let res
            it('should get a address', async () => {
                res = await request.get(`/addresses/${addressLocal.id}`)
                    .auth(username, password)

                // update local reference with successful response body
                addressLocal = res.body
                expect(res.status).to.equal(200)

            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })

        after('delete address, customer', async () => {
            await request.delete(`/addresses/${addressLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${addressLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('PATCH', async () => {
        // get example data
        let addressLocal = { ...address }
        let firstCustomerId
        before('create customer, job site, address', async () => {
            let personResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)

            // add required object references to example data before create
            firstCustomerId = personResponse.body.customer_id
            addressLocal.customer_id = personResponse.body.customer_id

            let addressResponse = await request.post('/addresses')
                .send(addressLocal)
                .auth(username, password)
            addressLocal = addressResponse.body
            expect(addressResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.patch(`/addresses/${addressLocal.id}`)
                    .send(addressLocal)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.patch(`/addresses/${addressLocal.id}`)
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
            it('should fail to update missing address body', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.patch(`/addresses/${missing_id}`)
                    .send(addressLocal)
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
            it('should update an address', async () => {
                res = await request.patch(`/addresses/${addressLocal.id}`)
                    .send({ "customer_id": secondCustomer.customer_id })
                    .auth(username, password)

                // update local reference with successful response body
                addressLocal = res.body
                expect(res.status).to.equal(200)



            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually update customer_id', async () => {
                res = await request.get(`/addresses/${addressLocal.id}`)
                    .auth(username, password)
                expect(res.body.customer_id).to.equal(secondCustomer.customer_id)
            })
            after('delete second customer', async () => {
                await request.patch(`/addresses/${addressLocal.id}`)
                    .send({ "customer_id": firstCustomerId })
                    .auth(username, password)
                await request.delete(`/customers/${secondCustomer.customer_id}`)
            })

        })

        after('delete address, customer', async () => {
            await request.delete(`/addresses/${addressLocal.id}`)
                .auth(username, password)
                .expect(200)

            await request.delete(`/customers/${addressLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('DELETE', async () => {
        let addressLocal = { ...address }
        before('create customer, job site, address', async () => {
            let personResponse = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            addressLocal.customer_id = personResponse.body.customer_id

            let addressResponse = await request.post('/addresses')
                .send(addressLocal)
                .auth(username, password)
            addressLocal = addressResponse.body
            expect(addressResponse.status).to.equal(201)
        })
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.delete(`/addresses/${addressLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to delete a missing address', async () => {
                // TODO: replace with dynamic "missing" id rather than hardcoded
                let missing_id = '00000'
                res = await request.delete(`/addresses/${missing_id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let res
            it('should delete an address', async () => {
                res = await request.delete(`/addresses/${addressLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })

        after('delete address, customer', async () => {

            await request.delete(`/addresses/${addressLocal.id}`)
                .auth(username, password)
                .expect(404)
            await request.delete(`/customers/${addressLocal.customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })
})