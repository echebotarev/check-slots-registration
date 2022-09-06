const puppeteer = require('puppeteer');
// const useProxy = require('puppeteer-page-proxy');

const proxyApi = require('./../proxyApi')

const { PROXY_IP, PROXY_PORT, PROXY_LOGIN, PROXY_PASSWORD } = process.env

let Browser = null
let Page = null

const Spider = {
	login: null,
	password: null,

	async open(url) {
		Browser = Browser || await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
			// defaultViewport : { width : 1280, height : 720 }
		});
		Page = await Browser.newPage();
		await Page.setExtraHTTPHeaders({
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'accept-encoding': 'gzip, deflate, br',
			'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36'
		})

		Page.once('load', () => console.log('Page loaded!'));

		// await Page.setRequestInterception(true);
		// Page.on('request', async (req) => {
		// 	if (req.isInterceptResolutionHandled()) return;
		//
		// 	const url = req.url()
		//
		// 	if (
		// 		req.resourceType() === 'stylesheet' ||
		// 		req.resourceType() === 'font' ||
		// 		req.resourceType() === 'image' ||
		// 		url.includes('stlog.kaspi.kz') ||
		// 		url.includes('google-analytics') ||
		// 		url.includes('vk.com') ||
		// 		url.includes('mc.yandex.ru') ||
		// 		url.includes('connect.facebook.net') ||
		// 		url.includes('googleads')
		// 	) {
		// 		await req.abort()
		// 		return true
		// 	}
		//
		// 	if (url.includes('https://kaspi.kz')) {
		// 		await useProxy(req, `http://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_IP}:${PROXY_PORT}`)
		// 		return true
		// 	}
		//
		// 	await req.continue()
		// });
		//
		// Page.on('response', async (res) => {
		// 	if (res.url().includes('authorizationserver/oauth/token?client_id=merchantcabinet')) {
		// 		const body = await res.json()
		// 		if (body) {
		// 			KaspiToken = body.access_token
		// 		}
		// 	}
		// })

		try {
			await Page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 })
		} catch (e) {
			await proxyApi.updateIp()

			console.error('Page.goto, line 74', e)
			await Spider.wait(1000)
			await Spider.close()
			return false
		}

		return true
	},

	async url(url) {
		if (Browser === null) {
			const result = await Spider.open(url)
			if (result === false) {
				return false
			}
			await Spider.wait(2000)

			return true
		}

		try {
			await Page.goto(url, { waitUntil: 'networkidle2' })
		} catch (e) {
			await proxyApi.updateIp()

			console.error('Page.goto, line 99', e)
			await Spider.close()
			return false
		}

		return true
	},

	getUrl() {
		return Page.url()
	},

	async getElement(args, rootElement = null) {
		let element = null
		if (rootElement) {
			element = await rootElement.$(args)
		} else {
			element = await Page.$(args)
		}

		return element
	},

	async getElements(args, rootElement) {
		let element = null
		if (rootElement) {
			element = await rootElement.$$(args)
		} else {
			element = await Page.$$(args)
		}

		return element
	},

	async getAttribute(element, attr) {
		return await Page.evaluate((el, attr) => el && el.getAttribute(attr), element, attr);
	},

	async getText(element) {
		return Page.evaluate(el => el && el.textContent, element)
	},

	async click(elem) {
		await elem.click()
	},

	async waitForSelector(arg, options = {}) {
		await Page.waitForSelector(arg, options)
	},

	async setValue(arg, value) {
		await Page.waitForSelector(arg);
		const el = await Page.$(arg)

		return await Page.evaluate((el, value) => el.value = value, el, value)
	},

	execFunction(fn, options, payload) {
		return Page.waitForFunction(fn, options, payload)
	},

	async close() {
		if (Browser) {
			await Browser.close()
		}

		Browser = null
		Page = null
	},

	async wait(ms) {
		await Page.waitForTimeout(ms)
	},
}

module.exports = Spider
