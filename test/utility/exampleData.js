export const customer = {
	crm_id: '0030L00f00d1v7DXcqtest',
	first_name: 'TestFirst',
	last_name: 'Collerweather',
	email: 'test@test.com',
	create_job_site: false,
	create_estimate: false,
	organization_name: 'Indow HQ',
	owner: 'adminuser',
	addresses: [{
		address: '504 Branard St.',
		address_ext: 'Unit A',
		city: 'Houston',
		state: 'TX',
		zipcode: '77006',
		country: 'United States',
		shipping: false
	}]
}

export const item = {
	shape: 'Rectangle',
	room: 'room1',
	location: 'loc1',
	floor: 'floor1',
	status: 'Include',
	product: 'T3 Insert',
	product_type: 'MG',
	tubing: 'White',
	frame_step: '1',
	frame_depth: 'Less than 5/8 in.',
	notes: 'note',
	A: 10,
	B: 11,
	C: 12,
	D: 13,
	E: 14,
	F: 15,
	width: 10,
	height: 20,
	spines: 'None',
	drafty_window: false,
	special_geometry: false,
}

export const sales_modifier = {
	id: '88590',
	quantity: 1,
	modifier: 'dollar',
	value: 100,
}

export const payment = {
	payment_received: '2021-10-22',
	payment_type: 'Check (down)',
	payment_amount: 200,
}

export const estimate = {
	organization_name: 'Indow HQ',
	owner: 'adminuser',
}

export const order = {
	organization_name: 'Indow HQ',
	owner: 'adminuser',
	status_code: '100',
}

export const site = {
	owner: 'adminuser',
	address_ext: '',
	address: '747 E 32nd Ave, #410',
	city: 'Eugene',
	state: 'OR',
	zipcode: '97405',
	address_type: 'residential',
	project_name: 'abcd',
}

export const address = {
	address_ext: '',
	address: '1501 E Evergreen Blvd',
	city: 'Seattle',
	state: 'WA',
	zipcode: '98102',
	country: 'United States',
	shipping: true,
	billing: false,
	other: false,
}
