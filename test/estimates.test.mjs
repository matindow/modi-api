/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './utility/config.mjs'
import { customer, estimate } from './utility/exampleData.mjs'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('estimates', async () => {
	describe('POST', async () => {
		let estimateLocal = { ...estimate }
		before('create customer, jobsite', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true
			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)
			estimateLocal.customer_id = customerResponse.body.id
			estimateLocal.site_id = customerResponse.body.site_id
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/estimates')
					.send(estimateLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/estimates')
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
			it('should create an estimate', async () => {
				response = await request.post('/estimates')
					.send(estimateLocal)
					.auth(username, password)
					.expect(201)
				estimateLocal = response.body
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually have created an estimate', async () => {
				await request.get(`/estimates/${estimateLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
		})

		after('delete estimate, customer, jobsite', async () => {
			await request.delete(`/estimates/${estimateLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/sites/${estimateLocal.site_id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${estimateLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('GET', async () => {
		let estimateLocal = { ...estimate }
		before('create customer, job site, estimate', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true

			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)

			// Add required object references to example data before create
			estimateLocal.customer_id = customerResponse.body.id
			estimateLocal.site_id = customerResponse.body.site_id

			const estimateResponse = await request.post('/estimates')
				.send(estimateLocal)
				.auth(username, password)
				.expect(201)
			estimateLocal = estimateResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.get(`/estimates/${estimateLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get missing estimate', async () => {
				const missingId = '00000'
				response = await request.get(`/estimates/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		describe('200', async () => {
			let response
			it('should get an estimate', async () => {
				response = await request.get(`/estimates/${estimateLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete estimate, customer', async () => {
			await request.delete(`/estimates/${estimateLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/sites/${estimateLocal.site_id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${estimateLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('PATCH', async () => {
		let estimateLocal = { ...estimate }
		let customerLocal = { ...customer }
		before('create customer, job site, estimate', async () => {
			customerLocal.create_job_site = true
			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)

			customerLocal = customerResponse.body
			// Add required object references to example data before create
			estimateLocal.customer_id = customerLocal.id
			estimateLocal.site_id = customerLocal.site_id

			const estimateResponse = await request.post('/estimates')
				.send(estimateLocal)
				.auth(username, password)
				.expect(201)
			estimateLocal = estimateResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.patch(`/estimates/${estimateLocal.id}`)
					.send(estimateLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.patch(`/estimates/${estimateLocal.id}`)
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
			it('should fail to update missing estimate body', async () => {
				const missingId = '00000'
				response = await request.patch(`/estimates/${missingId}`)
					.send(estimateLocal)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let secondCustomer
			before('create second customer', async () => {
				secondCustomer = { ...customer }
				const customerResponse = await request.post('/customers')
					.send(customerLocal)
					.auth(username, password)
					.expect(201)
				secondCustomer = customerResponse.body
			})
			let response
			it('should update an estimate', async () => {
				response = await request.patch(`/estimates/${estimateLocal.id}`)
					.send({ customer_id: secondCustomer.id })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually update customer_id', async () => {
				response = await request.get(`/estimates/${estimateLocal.id}`)
					.auth(username, password)
				expect(response.body.customer_id).to.equal(secondCustomer.id)
			})
			after('delete second customer', async () => {
				await request.patch(`/estimates/${estimateLocal.id}`)
					.send({ customer_id: customerLocal.id })
					.auth(username, password)
					.expect(200)
				await request.delete(`/customers/${secondCustomer.id}`)
					.expect(200)
			})
		})

		after('delete estimate, customer', async () => {
			await request.delete(`/estimates/${estimateLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/sites/${estimateLocal.site_id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${estimateLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('DELETE', async () => {
		let estimateLocal = { ...estimate }
		before('create customer, job site, estimate', async () => {
			const customerLocal = { ...customer }
			customerLocal.create_job_site = true
			const customerResponse = await request.post('/customers')
				.send(customerLocal)
				.auth(username, password)
				.expect(201)
			estimateLocal.customer_id = customerResponse.body.id
			estimateLocal.site_id = customerResponse.body.site_id

			const estimateResponse = await request.post('/estimates')
				.send(estimateLocal)
				.auth(username, password)
				.expect(201)
			estimateLocal = estimateResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.delete(`/estimates/${estimateLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to delete a missing estimate', async () => {
				const missingId = '00000'
				response = await request.delete(`/estimates/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete an estimate', async () => {
				response = await request.delete(`/estimates/${estimateLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete estimate, customer', async () => {
			await request.delete(`/estimates/${estimateLocal.id}`)
				.auth(username, password)
				.expect(404)
			await request.delete(`/sites/${estimateLocal.site_id}`)
				.auth(username, password)
				.expect(200)
			await request.delete(`/customers/${estimateLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})
})
