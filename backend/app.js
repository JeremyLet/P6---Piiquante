/** Definition of general variables and connect with mongoose */

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.log("Connexion à MongoDB échouée !"));
const app = express();
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
	);
	next();
});

/** Definition of the Rate Limiter params */

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // 50 req max per window (15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/** Definition of the sauces & users routes */

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

/** Activation of JSON format, Helmet Module, Rate Limiter, routes and Multer for the APP */

app.use(express.json());
app.use(
	helmet({
		crossOriginResourcePolicy: false,
	})
);
app.use(limiter);
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
module.exports = app;
