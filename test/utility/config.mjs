/* import/no-unassigned-import: "off" */
import process from 'node:process'
import 'dotenv/config'

const config = {
	username: process.env.MODI_USERNAME || '',
	password: process.env.MODI_PASSWORD || '',
	baseUrl: process.env.MODI_BASEURL || '',
}
export default config
