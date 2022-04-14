/* eslint-env mocha */

import * as path from 'node:path'
import chai from 'chai'
import supertest from 'supertest'
import chaiResponseValidator from 'chai-openapi-response-validator'
import config from './utility/config'
import { customer, site } from './utility/exampleData'

const { username, password, baseUrl } = config
const { expect } = chai
const request = supertest(baseUrl)
const dirname = path.resolve()
chai.should()

// Sets the location of your OpenAPI Specification file
chai.use(chaiResponseValidator.default(path.join(dirname, '/spec/swagger.yaml')))

describe('sites', async () => {
	describe('POST', async () => {
		let siteLocal = { ...site }
		before('create customer', async () => {
			const customerResponse = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)
			siteLocal.customer_id = customerResponse.body.id
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.post('/sites')
					.send(siteLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.post('/sites')
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
			it('should create an site', async () => {
				response = await request.post('/sites')
					.send(siteLocal)
					.auth(username, password)
					.expect(201)
				siteLocal = response.body
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually have created a site', async () => {
				response = await request.get(`/sites/${siteLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
		})

		after('delete site, customer', async () => {
			await request.delete(`/sites/${siteLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${siteLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('GET', async () => {
		let siteLocal = { ...site }
		before('create customer, job site', async () => {
			const customerResponse = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)

			// add required object references to example data before create
			siteLocal.customer_id = customerResponse.body.id

			const siteResponse = await request.post('/sites')
				.send(siteLocal)
				.auth(username, password)
				.expect(201)
			siteLocal = siteResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.get(`/sites/${siteLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to get missing site', async () => {
				const missingId = '00000'
				response = await request.get(`/sites/${missingId}`)
					.auth(username, password)
					.expect(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		describe('200', async () => {
			let response
			it('should get a site', async () => {
				response = await request.get(`/sites/${siteLocal.id}`)
					.auth(username, password)
					.expect(200)

				// update local reference with successful response body
				siteLocal = response.body
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete site, customer', async () => {
			await request.delete(`/sites/${siteLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${siteLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('PATCH', async () => {
		let siteLocal = { ...site }
		before('create customer, job site, site', async () => {
			const customerResponse = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)

			// add required object references to example data before create
			siteLocal.customer_id = customerResponse.body.id

			const siteResponse = await request.post('/sites')
				.send(siteLocal)
				.auth(username, password)
				.expect(201)
			siteLocal = siteResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.patch(`/sites/${siteLocal.id}`)
					.send(siteLocal)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('400', async () => {
			let response
			it('should fail with invalid body', async () => {
				response = await request.patch(`/sites/${siteLocal.id}`)
					.send({ invalid: 'invalid' })
					.auth(username, password)
				expect(response.status).to.equal(400)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to update missing site body', async () => {
				const missingId = '00000'
				response = await request.patch(`/sites/${missingId}`)
					.send(siteLocal)
					.auth(username, password)
				expect(response.status).to.equal(404)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should update an site', async () => {
				response = await request.patch(`/sites/${siteLocal.id}`)
					.send({ project_name: 'updated' })
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
			it('should actually update customer_id', async () => {
				response = await request.get(`/sites/${siteLocal.id}`)
					.auth(username, password)
					.expect(200)
				expect(response.body.project_name).to.equal('updated')
			})
		})

		after('delete site, customer', async () => {
			await request.delete(`/sites/${siteLocal.id}`)
				.auth(username, password)
				.expect(200)

			await request.delete(`/customers/${siteLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})

	describe('DELETE', async () => {
		let siteLocal = { ...site }
		before('create customer, site', async () => {
			const customerResponse = await request.post('/customers')
				.send(customer)
				.auth(username, password)
				.expect(201)
			siteLocal.customer_id = customerResponse.body.id

			const siteResponse = await request.post('/sites')
				.send(siteLocal)
				.auth(username, password)
				.expect(201)
			siteLocal = siteResponse.body
		})
		describe('401', async () => {
			let response
			it('should fail without auth', async () => {
				response = await request.delete(`/sites/${siteLocal.id}`)
					.expect(401)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('404', async () => {
			let response
			it('should fail to delete a missing site', async () => {
				const missingId = '00000'
				response = await request.delete(`/sites/${missingId}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})
		describe('200', async () => {
			let response
			it('should delete an site', async () => {
				response = await request.delete(`/sites/${siteLocal.id}`)
					.auth(username, password)
					.expect(200)
			})
			it('should satisfy api spec', () => {
				response.should.satisfyApiSpec
			})
		})

		after('delete site, customer', async () => {
			await request.delete(`/sites/${siteLocal.id}`)
				.auth(username, password)
				.expect(404)
			await request.delete(`/customers/${siteLocal.customer_id}`)
				.auth(username, password)
				.expect(200)
		})
	})
})
