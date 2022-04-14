/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './env/config.js'
import { customer } from './utility/exampleData.js'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('customers', async () => {
	describe('POST', async () => {
		let customerLocal = { ...customer }
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/customers')
					.send(customer)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/customers')
					.send({ invalid: 'invalid' })
					.auth(username, password)
					.expect(400)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('201', async () => {
			let response
			it('should create a customer', async () => {
				response = await request.post('/customers')
					.send(customerLocal)
					.auth(username, password)
					.expect(201)
				customerLocal = response.body
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
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
			const response = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)
			customerLocal = response.body
		})
		describe('401', async () => {
			let response
			it('should fail to get a customer without auth', async () => {
				response = await request.get(`/customers/${customerLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get a missing customer', async () => {
				const missingId = '00000'
				response = await request.get(`/customers/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should get a customer', async () => {
				response = await request.get(`/customers/${customerLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete customer', async () => {
			await request.delete(`/customers/${customerLocal.id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('PATCH', async () => {
		let customerLocal
		before('create customer', async () => {
			const response = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)
			customerLocal = response.body
		})
		describe('401', async () => {
			let response
			it('should fail to update a customer without auth', async () => {
				response = await request.patch(`/customers/${customerLocal.id}`)
					.send(customer)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail to update a customer with invalid body', async () => {
				response = await request.patch(`/customers/${customerLocal.id}`)
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
			it('should fail to update a missing customer', async () => {
				const missingId = '00000'
				response = await request.patch(`/customers/${missingId}`)
					.send(customer)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should update a customer', async () => {
				response = await request.patch(`/customers/${customerLocal.id}`)
					.send({ last_name: 'updated' })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})

			it('should actually update customer', async () => {
				response = await request.get(`/customers/${customerLocal.id}`)
					.auth(username, password)
					.expect(200)
				expect(response.body.last_name).to.equal('updated')
			})
		})
		after('delete customer', async () => {
			await request.delete(`/customers/${customerLocal.id}`)
				.auth(username, password)
				.expect(200)
		})
	})
	describe('DELETE', async () => {
		let customerLocal = { ...customer }
		before('create customer', async () => {
			const response = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)
			customerLocal = response.body
		})
		describe('401', async () => {
			let response
			it('should fail to delete a customer without auth', async () => {
				response = await request.delete(`/customers/${customerLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to delete a missing customer', async () => {
				const missingId = '00000'
				response = await request.delete(`/customers/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete a customer', async () => {
				response = await request.delete(`/customers/${customerLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		after('delete customer (should 404)', async () => {
			await request.delete(`/customers/${customerLocal.id}`)
				.auth(username, password)
				.expect(404)
		})
	})
})
