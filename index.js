const dotenv = require('dotenv')
dotenv.config()

const BlsSpainRussia = require('./providers/blsspain-russia')

const runSpider = async () => {
	await BlsSpainRussia.run()
	setTimeout(() => process.exit(), 1000)
}

setTimeout(runSpider, 1000)
