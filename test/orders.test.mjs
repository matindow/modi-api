/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './utility/config'
import { customer, order } from './utility/exampleData'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('orders', async () => {
	describe('POST', async () => {
		let orderLocal = { ...order }
		before('create customer, jobsite', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true
			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)
			orderLocal.customer_id = customerResponse.body.id
			orderLocal.site_id = customerResponse.body.site_id
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/orders')
					.send(orderLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/orders')
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
			it('should create an order', async () => {
				response = await request.post('/orders')
					.send(orderLocal)
					.auth(username, password)
					.expect(201)
				orderLocal = response.body
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete order, customer, jobsite', async () => {
			await request.delete(`/orders/${orderLocal.id}`)
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
		let orderLocal = { ...order }
		before('create customer, job site, order', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true

			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)

			// add required object references to example data before create
			orderLocal.customer_id = customerResponse.body.id
			orderLocal.site_id = customerResponse.body.site_id

			const orderResponse = await request.post('/orders')
				.send(orderLocal)
				.auth(username, password)
				.expect(201)
			orderLocal = orderResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.get(`/orders/${orderLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get missing order', async () => {
				const missingId = '00000'
				response = await request.get(`/orders/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		describe('200', async () => {
			let response
			it('should get an order', async () => {
				response = await request.get(`/orders/${orderLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete order, customer', async () => {
			await request.delete(`/orders/${orderLocal.id}`)
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

	describe('PATCH', async () => {
		let orderLocal = { ...order }
		before('create customer, job site, order', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true
			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)

			// add required object references to example data before create
			orderLocal.customer_id = customerResponse.body.id
			orderLocal.site_id = customerResponse.body.site_id

			const orderResponse = await request.post('/orders')
				.send(orderLocal)
				.auth(username, password)
				.expect(201)
			orderLocal = orderResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.patch(`/orders/${orderLocal.id}`)
					.send(orderLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.patch(`/orders/${orderLocal.id}`)
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
			it('should fail to update missing order body', async () => {
				const missingId = '00000'
				response = await request.patch(`/orders/${missingId}`)
					.send(orderLocal)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should update an order', async () => {
				response = await request.patch(`/orders/${orderLocal.id}`)
					.send({ status_code: '200' })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually update order', async () => {
				response = await request.get(`/orders/${orderLocal.id}`)
					.auth(username, password)
					.expect(200)
				expect(response.body.status_code).to.equal('200')
			})
		})

		after('delete order, customer', async () => {
			await request.delete(`/orders/${orderLocal.id}`)
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

	describe('DELETE', async () => {
		let orderLocal = { ...order }
		before('create customer, job site, order', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true
			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)
			orderLocal.customer_id = customerResponse.body.id
			orderLocal.site_id = customerResponse.body.site_id

			const orderResponse = await request.post('/orders')
				.send(orderLocal)
				.auth(username, password)
				.expect(201)
			orderLocal = orderResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.delete(`/orders/${orderLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to delete a missing order', async () => {
				const missingId = '00000'
				response = await request.delete(`/orders/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete an order', async () => {
				response = await request.delete(`/orders/${orderLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete order, customer', async () => {
			await request.delete(`/orders/${orderLocal.id}`)
				.auth(username, password)
				.expect(404)
			await request.delete(`/sites/${orderLocal.site_id}`)
				.auth(username, password)
				.expect(200)
			await request.delete(`/customers/${orderLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})
})
