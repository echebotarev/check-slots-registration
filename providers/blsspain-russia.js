/**
 * Провайдер испанского консульства в Санкт-Петербурге
 * */

const Spider = require('./../libs/spider')

const URL = 'https://blsspain-russia.com/peters/book_appointment.php'
const MAIL_URL = 'https://mail.ru'

const BlsSpainRussia = {
	async run(url = MAIL_URL) {
		await Spider.open(url)

		// const button = await Spider.getElement('#app_type2')
		// // const className = await Spider.getAttribute(button, 'class')
		// if (button) {
		// 	await button.click()
		// }
		//
		// await Spider.page.select('#centre', '7#2')
		// await Spider.wait(2000)
		// await Spider.page.select('#category', 'Normal')
		//
		// await Spider.setValue('#phone', '9111721308')
		// await Spider.setValue('#email', '9111721308@mail.ru')

		await this.getCodeFromMail()

		await Spider.wait(80000)
	},

	async getCodeFromMail() {
		const page = await Spider.browser.newPage()
		await page.goto('https://mail.ru', { waitUntil: 'networkidle2' })

		await Spider.wait(3000)

		let button = await page.$('#mailbox button')
		await button.click()

		await Spider.wait(5000)

		const elementHandle = await page.$('.ag_js-popup-frame iframe')
		const frame = await elementHandle.contentFrame()

		let input = await frame.$('.login-row.username input')
		await input.type('9111721308@mail.ru')
		// await frame.evaluate((el, value) => el.value = value, input, '9111721308@mail.ru')

		button = await frame.$('.submit-button-wrap button[type="submit"]')
		await button.click()

		await Spider.wait(5000)

		input = await frame.$('input[name="password"]')
		await input.type('urMmGFi7XghKKW')

		button = await frame.$('.submit-button-wrap button[type="submit"]')
		await button.click()
		// await frame.evaluate((el, value) => el.value = value, input, 'urMmGFi7XghKKW')
	}
}

module.exports = BlsSpainRussia
