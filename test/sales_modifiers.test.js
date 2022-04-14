/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './utility/config.js'
import { customer, order, sales_modifier } from './utility/exampleData.js'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('sales_modifiers', async () => {
	describe('POST', async () => {
		let orderLocal = { ...order }
		const sales_modifierLocal = { ...sales_modifier }
		before('create customer, jobsite, estimate', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true
			customerLocal.create_estimate = true
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
			sales_modifierLocal.order_id = orderLocal.id
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/sales_modifiers')
					.send(sales_modifierLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/sales_modifiers')
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
			it('should create a sales_modifier', async () => {
				response = await request.post('/sales_modifiers')
					.send(sales_modifierLocal)
					.auth(username, password)
					.expect(201)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should be visible on the order', async () => {
				const orderResponse = await request.get(`/orders/${orderLocal.id}`)
					.query({ sales_modifiers: 'true' })
					.auth(username, password)
					.expect(200)
				expect(orderResponse.body.sales_modifiers.length).to.equal(1)
				expect(orderResponse.body.sales_modifiers[0].id).to.equal(response.body.id)
			})
			after('delete sales_modifier', async () => {
				await request.delete(`/sales_modifiers/${response.body.id}`)
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
		let sales_modifierLocal = { ...sales_modifier }
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

			// add required object references to example data before create
			orderLocal = orderResponse.body
			sales_modifierLocal.order_id = orderLocal.id

			const sales_modifierResponse = await request.post('/sales_modifiers')
				.send(sales_modifierLocal)
				.auth(username, password)
				.expect(201)
			sales_modifierLocal = sales_modifierResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.get(`/sales_modifiers/${sales_modifierLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get missing sales_modifier', async () => {
				const missingId = '00000'
				response = await request.get(`/sales_modifiers/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		describe('200', async () => {
			let response
			it('should get an sales_modifier', async () => {
				response = await request.get(`/sales_modifiers/${sales_modifierLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete sales_modifier, job_site, customer', async () => {
			await request.delete(`/sales_modifiers/${sales_modifierLocal.id}`)
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
		let sales_modifierLocal = { ...sales_modifier }
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
			sales_modifierLocal.order_id = orderLocal.id

			const sales_modifierResponse = await request.post('/sales_modifiers')
				.send(sales_modifierLocal)
				.auth(username, password)
				.expect(201)
			sales_modifierLocal = sales_modifierResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.patch(`/sales_modifiers/${sales_modifierLocal.id}`)
					.send(sales_modifierLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.patch(`/sales_modifiers/${sales_modifierLocal.id}`)
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
				response = await request.patch(`/sales_modifiers/${missingId}`)
					.send(sales_modifierLocal)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should update an sales_modifier', async () => {
				response = await request.patch(`/sales_modifiers/${sales_modifierLocal.id}`)
					.send({ value: 500 })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually update sales_modifier', async () => {
				response = await request.get(`/sales_modifiers/${sales_modifierLocal.id}`)
					.auth(username, password)
					.expect(200)
				expect(response.body.value).to.equal(500)
			})
		})

		after('delete job_site, sales_modifier, customer', async () => {
			await request.delete(`/sales_modifiers/${sales_modifierLocal.id}`)
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
		let sales_modifierLocal = { ...sales_modifier }
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
			sales_modifierLocal.order_id = orderLocal.id

			const sales_modifierResponse = await request.post('/sales_modifiers')
				.send(sales_modifierLocal)
				.auth(username, password)
				.expect(201)
			sales_modifierLocal = sales_modifierResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.delete(`/sales_modifiers/${sales_modifierLocal.id}`)
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
				response = await request.delete(`/sales_modifiers/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete an sales_modifier', async () => {
				response = await request.delete(`/sales_modifiers/${sales_modifierLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete job_site, sales_modifier, customer', async () => {
			await request.delete(`/sales_modifiers/${sales_modifierLocal.id}`)
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
