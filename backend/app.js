const express = require("express");
const path = require("path");
const helmet = require("helmet");
const mongoose = require("mongoose");

mongoose
	.connect(
		"mongodb+srv://Piiquante:Piiquante@generalcluster.r8fpobw.mongodb.net/Piiquante?retryWrites=true&w=majority",
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

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

app.use(express.json());
app.use(
	helmet({
		crossOriginResourcePolicy: false,
	})
);
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
