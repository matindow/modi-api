/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './env/config.js'
import { customer, order, payment } from './utility/exampleData.js'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('payments', async () => {
	describe.only('POST', async () => {
		let orderLocal = { ...order }
		let paymentLocal = { ...payment }
		before('create customer, jobsite', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true
			const response = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)
			orderLocal.customer_id = response.body.id
			orderLocal.site_id = response.body.site_id

			const orderResponse = await request.post('/orders')
				.send(orderLocal)
				.auth(username, password)
				.expect(201)
			orderLocal = orderResponse.body
			paymentLocal.order_id = orderResponse.body.id
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/payments')
					.send(payment)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/payments')
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
			it('should create a payment', async () => {
				response = await request.post('/payments')
					.send(paymentLocal)
					.auth(username, password)
					.expect(201)
				paymentLocal = response.body
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should be visible on the order', async () => {
				const orderResponse = await request.get(`/orders/${paymentLocal.order_id}`)
					.query({ payments: 'true' })
					.auth(username, password)
					.expect(200)
				expect(orderResponse.body.payments.length).to.equal(1)
				expect(orderResponse.body.payments[0].id).to.equal(paymentLocal.id)
			})
			after('delete payment', async () => {
				await request.delete(`/payments/${paymentLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
		})

		after('delete order, jobsite, customer', async () => {
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
		let paymentLocal = { ...payment }
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

			// add required object references to example data before create
			paymentLocal.order_id = orderLocal.id

			const paymentResponse = await request.post('/payments')
				.send(paymentLocal)
				.auth(username, password)
				.expect(201)
			paymentLocal = paymentResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.get(`/payments/${paymentLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get missing payment', async () => {
				const missingId = '00000'
				response = await request.get(`/payments/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		describe('200', async () => {
			let response
			it('should get an payment', async () => {
				response = await request.get(`/payments/${paymentLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete payment, job_site, customer', async () => {
			await request.delete(`/payments/${paymentLocal.id}`)
				.auth(username, password)
				.expect(200)

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
		let paymentLocal = { ...payment }
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
			// add required object references to example data before create
			paymentLocal.order_id = orderLocal.id

			const paymentResponse = await request.post('/payments')
				.send(paymentLocal)
				.auth(username, password)
				.expect(201)
			paymentLocal = paymentResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.patch(`/payments/${paymentLocal.id}`)
					.send(paymentLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.patch(`/payments/${paymentLocal.id}`)
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
				response = await request.patch(`/payments/${missingId}`)
					.send(paymentLocal)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should update an payment', async () => {
				response = await request.patch(`/payments/${paymentLocal.id}`)
					.send({ payment_amount: 500 })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually update payment', async () => {
				response = await request.get(`/payments/${paymentLocal.id}`)
					.auth(username, password)
					.expect(200)
				expect(response.body.payment_amount).to.equal(500)
			})
		})

		after('delete job_site, payment, customer', async () => {
			await request.delete(`/payments/${paymentLocal.id}`)
				.auth(username, password)
				.expect(200)

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
		let paymentLocal = { ...payment }
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
			// add required object references to example data before create
			paymentLocal.order_id = orderLocal.id

			const paymentResponse = await request.post('/payments')
				.send(paymentLocal)
				.auth(username, password)
				.expect(201)
			paymentLocal = paymentResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.delete(`/payments/${paymentLocal.id}`)
					.send(paymentLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to delete missing order body', async () => {
				const missingId = '00000'
				response = await request.delete(`/payments/${missingId}`)
					.send(paymentLocal)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete an payment', async () => {
				response = await request.delete(`/payments/${paymentLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete job_site, payment, customer', async () => {
			await request.delete(`/payments/${paymentLocal.id}`)
				.auth(username, password)
				.expect(404)

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
})
