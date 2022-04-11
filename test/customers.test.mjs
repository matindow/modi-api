import { customer } from './utility/exampleData.mjs'
import { randomString } from './utility/utlity.mjs'
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

let vars = {}
describe('customers', async () => {

    describe('POST', async () => {
        let customer_id
        describe('401', async => {
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
        describe('400', async => {
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
        describe('201', async => {
            let res
            it('should create a customer', async () => {
                res = await request.post('/customers')
                    .send(customer)
                    .auth(username, password)
                    .expect(201)
                customer_id = res.body.customer_id
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        after(async () => {
            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    })

    describe('GET', async () => {
        let customer_id
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            customer_id = res.body.customer_id
        })
        describe('401', async () => {
            let res
            it('should fail to get a customer without auth', async () => {
                res = await request.get(`/customers/${customer_id}`)
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

                res = await request.get(`/customers/${customer_id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })


        after('delete customer', async () => {
            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })
    });

    describe('PATCH', async => {
        let customer_id
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            customer_id = res.body.customer_id
        })
        describe('401', async () => {
            let res
            it('should fail to update a customer without auth', async () => {
                res = await request.patch(`/customers/${customer_id}`)
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
                res = await request.patch(`/customers/${customer_id}`)
                    .send({ "invalid": "invalid" })
                    .auth(username, password)
                expect(res.status).to.equal(400)

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
                expect(res.status).to.equal(404)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

        })
        describe('200', async () => {
            let customerLocal = { ...customer }
            customerLocal.last_name = 'updated'
            let res
            it('should update a customer', async () => {

                res = await request.patch(`/customers/${customer_id}`)
                    .send(customerLocal)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })

            it('should actually update customer', async () => {
                res = await request.get(`/customers/${customer_id}`)
                    .auth(username, password)
                    .expect(200)
                expect(res.body.last_name).to.equal(customerLocal.last_name)
            })
        });
        after('delete customer', async () => {
            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(200)
        })

    })
    describe('DELETE', async => {
        let customer_id
        before('create customer', async () => {
            let res = await request.post('/customers')
                .send(customer)
                .auth(username, password)
                .expect(201)
            customer_id = res.body.customer_id
        })
        describe('401', async () => {
            let res
            it('should fail to delete a customer without auth', async () => {
                res = await request.delete(`/customers/${customer_id}`)
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
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        });
        describe('200', async () => {
            let res
            it('should delete a customer', async () => {
                // 
                res = await request.delete(`/customers/${customer_id}`)
                    .auth(username, password)
                    .expect(200)
            })
            it('should satisfy api spec', () => {
                res.should.satisfyApiSpec
            })
        })
        after('delete customer', async () => {

            await request.delete(`/customers/${customer_id}`)
                .auth(username, password)
                .expect(404)
        })
    })
})
