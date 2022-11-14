/** Importing the password validator module */

const passwordValidator = require("password-validator");
const { $where } = require("../models/User");

/** Creating the schema of validation for Password Validator */

let passwordSchema = new passwordValidator();
passwordSchema.is().min(8).has().digits(1).has().uppercase(1);

/** Settings */

module.exports = (req, res, next) => {
	if (passwordSchema.validate(req.body.password)) {
		next();
	} else {
		return res.status(400).json({
			message: `Le mot de passe n'est pas conforme : ${passwordSchema.validate(
				req.body.password,
				{ list: true }
			)}`,
		});
	}
};
