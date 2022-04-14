/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './utility/config.js'
import { customer, order, item } from './utility/exampleData.js'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('items', async () => {
	describe('POST', async () => {
		let orderLocal = { ...order }
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
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/items')
					.send(item)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/items')
					.send({ invalid: 'invalid' })
					.auth(username, password)
					.expect(400)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('201', async () => {
			describe('order', async () => {
				const itemLocal = { ...item }
				itemLocal.order_id = orderLocal.id
				let itemResponse
				it('should create an item', async () => {
					itemResponse = await request.post('/items')
						.send(itemLocal)
						.auth(username, password)
						.expect(201)
				})
				it('should satisfy api spec', () => {
					itemResponse.should.satisfyApiSpec
				})
				it('should be visible on the order', async () => {
					const orderResponse = await request.get(`/orders/${orderLocal.id}`)
						.auth(username, password)
						.expect(200)
					expect(orderResponse.body.items.length).to.equal(1)
					expect(orderResponse.body.items[0].id).to.equal(itemResponse.body.id)
				})
				after('delete item', async () => {
					await request.delete(`/items/${itemResponse.body.id}`)
				})
			})
			describe('estimate', async () => {
				const itemLocal = { ...item }
				itemLocal.estimate_id = orderLocal.estimate_id
				let itemResponse
				it('should create an item', async () => {
					itemResponse = await request.post('/items')
						.send(itemLocal)
						.auth(username, password)
						.expect(201)
				})
				it('should satisfy api spec', () => {
					itemResponse.should.satisfyApiSpec
				})
				it('should be visible on the estimate', async () => {
					const estimateResponse = await request.get(`/estimates/${orderLocal.estimate_id}`)
						.auth(username, password)
						.expect(200)
					expect(estimateResponse.body.items.length).to.equal(1)
					expect(estimateResponse.body.items[0].id).to.equal(itemResponse.body.id)
				})
				after('delete item', async () => {
					await request.delete(`/items/${itemResponse.body.id}`)
				})
			})
			describe('site', async () => {
				const itemLocal = { ...item }
				itemLocal.site_id = orderLocal.site_id
				let itemResponse
				it('should create an item', async () => {
					itemResponse = await request.post('/items')
						.send(itemLocal)
						.auth(username, password)
						.expect(201)
				})
				it('should satisfy api spec', () => {
					itemResponse.should.satisfyApiSpec
				})
				it('should be visible on the site', async () => {
					const siteResponse = await request.get(`/sites/${orderLocal.site_id}`)
						.auth(username, password)
						.expect(200)
					expect(siteResponse.body.items.length).to.equal(1)
					expect(siteResponse.body.items[0].id).to.equal(itemResponse.body.id)
				})
				after('delete item', async () => {
					await request.delete(`/items/${itemResponse.body.id}`)
				})
			})
		})

		after('delete order, jobsite, estimate, customer', async () => {
			await request.delete(`/orders/${orderLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/estimates/${orderLocal.estimate_id}`)
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
		let itemLocal = { ...item }
		const customerLocal = { ...customer }
		before('create customer, job site', async () => {
			customerLocal.create_job_site = true

			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)

			// Add required object references to example data before create
			itemLocal.site_id = customerResponse.body.site_id

			const itemResponse = await request.post('/items')
				.send(itemLocal)
				.auth(username, password)
				.expect(201)
			itemLocal = itemResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.get(`/items/${itemLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get missing item', async () => {
				const missingId = '00000'
				response = await request.get(`/items/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		describe('200', async () => {
			let response
			it('should get an item', async () => {
				response = await request.get(`/items/${itemLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete item, job_site, customer', async () => {
			await request.delete(`/items/${itemLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/sites/${itemLocal.site_id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${customerLocal.id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('PATCH', async () => {
		let itemLocal = { ...item }
		let customerLocal = { ...customer }
		before('create customer, job site', async () => {
			customerLocal.create_job_site = true
			customerLocal.create_estimate = true

			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)

			// Add required object references to example data before create
			itemLocal.site_id = customerResponse.body.site_id
			customerLocal = customerResponse.body

			const itemResponse = await request.post('/items')
				.send(itemLocal)
				.auth(username, password)
				.expect(201)
			itemLocal = itemResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.patch(`/items/${itemLocal.id}`)
					.send(itemLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.patch(`/items/${itemLocal.id}`)
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
				response = await request.patch(`/items/${missingId}`)
					.send(itemLocal)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should update an item', async () => {
				response = await request.patch(`/items/${itemLocal.id}`)
					.send({ estimate_id: customerLocal.estimate_id, site_id: '' })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually update item', async () => {
				response = await request.get(`/items/${itemLocal.id}`)
					.auth(username, password)
					.expect(200)
				expect(response.body.estimate_id).to.equal(customerLocal.estimate_id)
			})
		})

		after('delete item, estimate, site, customer', async () => {
			await request.delete(`/items/${itemLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/estimates/${customerLocal.estimate_id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/sites/${customerLocal.site_id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${customerLocal.id}`)
				.auth(username, password)
				.expect(200)
		})
	})
	describe('DELETE', async () => {
		let itemLocal = { ...item }
		let customerLocal = { ...customer }
		before('create customer, job site', async () => {
			customerLocal.create_job_site = true

			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)

			// Add required object references to example data before create
			itemLocal.site_id = customerResponse.body.site_id
			customerLocal = customerResponse.body

			const itemResponse = await request.post('/items')
				.send(itemLocal)
				.auth(username, password)
				.expect(201)
			itemLocal = itemResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.delete(`/items/${itemLocal.id}`)
					.send(itemLocal)
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
				response = await request.delete(`/items/${missingId}`)
					.send(itemLocal)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete an item', async () => {
				response = await request.delete(`/items/${itemLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete job_site, item, customer', async () => {
			await request.delete(`/items/${itemLocal.id}`)
				.auth(username, password)
				.expect(404)

			await request.delete(`/sites/${customerLocal.site_id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${customerLocal.id}`)
				.auth(username, password)
				.expect(200)
		})
	})
})
