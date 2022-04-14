import { customer } from './utility/exampleData.mjs'
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

describe('customers', async () => {

    describe('POST', async () => {
        let customerLocal = { ...customer }
        describe('401', async () => {
            let res
            it('should fail without auth', async () => {
                res = await request.post('/customers')
                    .send(customer)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('400', async () => {
            let res
            it('should fail with invalid body', async () => {
                res = await request.post('/customers')
                    .send({ "invalid": "invalid" })
                    .auth(username, password)
                    .expect(400)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('201', async () => {
            let res
            it('should create a customer', async () => {
                res = await request.post('/customers')
                    .send(customerLocal)
                    .auth(username, password)
                    .expect(201)
                customerLocal = res.body
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
            it('should actually have created a customer', async () => {
                await request.get(`/customers/${customerLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            after('delete customer', async () => {
                await request.delete(`/customers/${customerLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
        })
    })

    describe('GET', async () => {
        let customerLocal = { ...customer }
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customerLocal)
                .auth(username, password)
                .expect(201)
            customerLocal = res.body
        })
        describe('401', async () => {
            let res
            it('should fail to get a customer without auth', async () => {
                res = await request.get(`/customers/${customerLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('404', async () => {
            let res
            it('should fail to get a missing customer', async () => {
                let missing_id = '00000'
                res = await request.get(`/customers/${missing_id}`)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let res
            it('should get a customer', async () => {

                res = await request.get(`/customers/${customerLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })


        after('delete customer', async () => {
            await request.delete(`/customers/${customerLocal.id}`)
                .auth(username, password)
                .expect(200)
        })
    });

    describe('PATCH', async () => {
        let customerLocal
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            customerLocal = res.body
        })
        describe('401', async () => {
            let res
            it('should fail to update a customer without auth', async () => {
                res = await request.patch(`/customers/${customerLocal.id}`)
                    .send(customer)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('400', async () => {
            let res
            it('should fail to update a customer with invalid body', async () => {
                res = await request.patch(`/customers/${customerLocal.id}`)
                    .send({ "invalid": "invalid" })
                    .auth(username, password)
                    .expect(400)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('404', async () => {
            let res
            it('should fail to update a missing customer', async () => {
                let missing_id = '00000'
                res = await request.patch(`/customers/${missing_id}`)
                    .send(customer)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let res
            it('should update a customer', async () => {
                res = await request.patch(`/customers/${customerLocal.id}`)
                    .send({ "last_name": "updated" })
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

            it('should actually update customer', async () => {
                res = await request.get(`/customers/${customerLocal.id}`)
                    .auth(username, password)
                    .expect(200)
                expect(res.body.last_name).to.equal("updated")
            })
        });
        after('delete customer', async () => {
            await request.delete(`/customers/${customerLocal.id}`)
                .auth(username, password)
                .expect(200)
        })

    })
    describe('DELETE', async () => {
        let customerLocal = { ...customer }
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            customerLocal = res.body
        })
        describe('401', async () => {
            let res
            it('should fail to delete a customer without auth', async () => {
                res = await request.delete(`/customers/${customerLocal.id}`)
                    .expect(401)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        describe('404', async () => {
            let res
            it('should fail to delete a missing customer', async () => {
                let missing_id = '00000'
                res = await request.delete(`/customers/${missing_id}`)
                    .auth(username, password)
                    .expect(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('200', async () => {
            let res
            it('should delete a customer', async () => {
                res = await request.delete(`/customers/${customerLocal.id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        after('delete customer (should 404)', async () => {
            await request.delete(`/customers/${customerLocal.id}`)
                .auth(username, password)
                .expect(404)
        })
    })
})
