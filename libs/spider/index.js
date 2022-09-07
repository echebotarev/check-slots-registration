const dotenv = require('dotenv')
dotenv.config()

// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
	RecaptchaPlugin({
		provider: {
			id: '2captcha',
			token: process.env.TOKEN_2CAPTCHA
		},
		visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
	})
)

// const useProxy = require('puppeteer-page-proxy');

const proxyApi = require('./../proxyApi')

const { PROXY_IP, PROXY_PORT, PROXY_LOGIN, PROXY_PASSWORD } = process.env

const Spider = {
	login: null,
	password: null,

	browser: null,
	page: null,

	async open(url) {
		this.browser = this.browser || await puppeteer.launch({
			headless: false,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
			defaultViewport : { width : 1280, height : 720 }
		});
		this.page = await this.browser.newPage();

		this.page.once('load', () => console.log('Page loaded!'));

		// await this.page.setRequestInterception(true);
		// this.page.on('request', async (req) => {
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
		// this.page.on('response', async (res) => {
		// 	if (res.url().includes('authorizationserver/oauth/token?client_id=merchantcabinet')) {
		// 		const body = await res.json()
		// 		if (body) {
		// 			KaspiToken = body.access_token
		// 		}
		// 	}
		// })

		try {
			await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 50000 })

			// await Spider.wait(5000)
			// const result = await this.page.solveRecaptchas()
			// await Spider.wait(5000)

			// if (result.captchas.length === 0) {
			// 	await Spider.wait(60000)
			// }
			//
			// console.log('Captcha Result', result)
		} catch (e) {
			// await proxyApi.updateIp()

			console.error('Page.goto, line 74', e)
			await Spider.wait(1000)
			await Spider.close()
			return false
		}

		return true
	},

	async url(url) {
		if (this.browser === null) {
			const result = await Spider.open(url)
			if (result === false) {
				return false
			}
			await Spider.wait(2000)

			return true
		}

		try {
			await this.page.goto(url, { waitUntil: 'networkidle2' })
		} catch (e) {
			await proxyApi.updateIp()

			console.error('Page.goto, line 99', e)
			await Spider.close()
			return false
		}

		return true
	},

	solveRecaptchas() {
		return this.page.solveRecaptchas()
	},

	getUrl() {
		return this.page.url()
	},

	async getElement(args, rootElement = null) {
		let element = null
		if (rootElement) {
			element = await rootElement.$(args)
		} else {
			element = await this.page.$(args)
		}

		return element
	},

	async getElements(args, rootElement) {
		let element = null
		if (rootElement) {
			element = await rootElement.$$(args)
		} else {
			element = await this.page.$$(args)
		}

		return element
	},

	async getAttribute(element, attr) {
		return await this.page.evaluate((el, attr) => el && el.getAttribute(attr), element, attr);
	},

	async getText(element) {
		return this.page.evaluate(el => el && el.textContent, element)
	},

	async click(elem) {
		await elem.click()
	},

	async waitForSelector(arg, options = {}) {
		await this.page.waitForSelector(arg, options)
	},

	async setValue(arg, value) {
		await this.page.waitForSelector(arg);
		const el = await this.page.$(arg)

		return await this.page.evaluate((el, value) => el.value = value, el, value)
	},

	execFunction(fn, options, payload) {
		return this.page.waitForFunction(fn, options, payload)
	},

	async close() {
		if (this.browser) {
			await this.browser.close()
		}

		this.browser = null
		this.page = null
	},

	async wait(ms) {
		await this.page.waitForTimeout(ms)
	},
}

module.exports = Spider
