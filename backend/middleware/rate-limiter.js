/** Definition of the Rate Limiter params */

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes in ms
	max: 5, // 5 req max per window (5 minutes)
	message: "Too many attempts, please try again after 15 minutes",
	statusCode: 429,
	headers: true,
});

module.exports = limiter;
