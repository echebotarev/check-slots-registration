const fetch = require('node-fetch')
const dotenv = require('dotenv')
dotenv.config()

const URL = 'http://astroproxy.com/api/v1'
const PROXY_TOKEN = process.env.PROXY_TOKEN
const PORT_ID = process.env.PORT_ID

const withProxy = parseInt(process.env.WITH_PROXY || '0')

const proxyApi = withProxy ? {
	async updateIp(portId = PORT_ID) {
		await fetch(`${URL}/ports/${portId}/newip?token=${PROXY_TOKEN}`)
	}
} : {
	updateIp(portId) {
		return Promise.resolve(undefined);
	}
}

module.exports = proxyApi
