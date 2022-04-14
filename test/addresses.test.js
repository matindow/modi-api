/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './utility/config.js'
import { customer, address } from './utility/exampleData.js'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('addresses', async () => {
	describe('POST', async () => {
		let addressLocal = { ...address }
		before('create customer', async () => {
			const response = await request.post('/customers')
				.send(customer)
				.auth(username, password)
			addressLocal.customer_id = response.body.id
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/addresses')
					.send(addressLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/addresses')
					.send({ invalid: 'invalid' })
					.auth(username, password)
				expect(response.status).to.equal(400)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('201', async () => {
			let response
			it('should create an address', async () => {
				response = await request.post('/addresses')
					.send(addressLocal)
					.auth(username, password)
					.expect(201)
				addressLocal = response.body
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually have created an address', async () => {
				await request.get(`/addresses/${response.body.id}`)
					.auth(username, password)
					.expect(200)
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

	describe('GET', async () => {
		let addressLocal = { ...address }
		before('create customer', async () => {
			const customerResponse = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)

			// Add required object references to example data before create
			addressLocal.customer_id = customerResponse.body.id

			const addressResponse = await request.post('/addresses')
				.send(addressLocal)
				.auth(username, password)
				.expect(201)
			addressLocal = addressResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.get(`/addresses/${addressLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get missing address', async () => {
				const missingId = '00000'
				response = await request.get(`/addresses/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		describe('200', async () => {
			let response
			it('should get a address', async () => {
				response = await request.get(`/addresses/${addressLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
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
		let addressLocal = { ...address }
		before('create customer, address', async () => {
			const customerResponse = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)

			// Add required object references to example data before create
			addressLocal.customer_id = customerResponse.body.id

			const addressResponse = await request.post('/addresses')
				.send(addressLocal)
				.auth(username, password)
				.expect(201)
			addressLocal = addressResponse.body
		})

		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.patch(`/addresses/${addressLocal.id}`)
					.send(addressLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.patch(`/addresses/${addressLocal.id}`)
					.send({ invalid: 'invalid' })
					.auth(username, password)
					.expect(400)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to update missing address body', async () => {
				const missingId = '00000'
				response = await request.patch(`/addresses/${missingId}`)
					.send({ address: 'updated' })
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should update an address', async () => {
				response = await request.patch(`/addresses/${addressLocal.id}`)
					.send({ address: 'updated' })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually have updated address', async () => {
				response = await request.get(`/addresses/${addressLocal.id}`)
					.auth(username, password)
					.expect(200)
				expect(response.body.address).to.equal('updated')
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
			const customerResponse = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)
			addressLocal.customer_id = customerResponse.body.id

			const addressResponse = await request.post('/addresses')
				.send(addressLocal)
				.auth(username, password)
				.expect(201)
			addressLocal = addressResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.delete(`/addresses/${addressLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to delete a missing address', async () => {
				const missingId = '00000'
				response = await request.delete(`/addresses/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete an address', async () => {
				response = await request.delete(`/addresses/${addressLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
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
