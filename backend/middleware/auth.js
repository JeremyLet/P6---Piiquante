/** Implementing Json Web Token and Dot Env for security */

const jwt = require("jsonwebtoken");
require("dotenv").config();

/** Function to handle the authentification with token */

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.DB_TOKEN);
		const userId = decodedToken.userId;
		req.auth = {
			userId: userId,
		};
		next();
	} catch (error) {
		res.status(401).json({ error });
	}
};
