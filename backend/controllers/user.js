/** Installing necessary modules for security (bcrypt, JSONWebToken, DotEnv and passwordValidator) & getting the user model */

const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const passwordValidator = require("password-validator");

/** Creating the schema of validation for Password Validator */

let schema = new passwordValidator();
schema.is().min(8).has().digits(1).has().uppercase(1);

/** Function to create an user */

exports.signup = (req, res, next) => {
	if (schema.validate(req.body.password) == false) {
		res.status(400).json({
			message: schema.validate(req.body.password, { details: true }),
		});
	} else {
		bcrypt
			.hash(req.body.password, 10)
			.then((hash) => {
				const user = new User({
					email: req.body.email,
					password: hash,
				});
				user
					.save()
					.then(() => res.status(201).json({ message: "Utilisateur créé !" }))
					.catch((error) => res.status(400).json({ error }));
			})
			.catch((error) => res.status(500).json({ error }));
	}
};

/** Function to login an user */

exports.login = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non trouvé !" });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((valid) => {
					if (!valid) {
						return res.status(401).json({ error: "Mot de passe incorrect !" });
					}
					res.status(200).json({
						userId: user._id,
						token: jwt.sign({ userId: user._id }, process.env.DB_TOKEN, {
							expiresIn: "24h",
						}),
					});
				})
				.catch((error) => res.status(500).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};
