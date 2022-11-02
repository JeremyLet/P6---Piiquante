const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	delete sauceObject.userId;
	const sauce = new Sauce({
		...sauceObject,
		userId: req.auth.userId,
		name: sauceObject.name,
		manufacturer: sauceObject.manufacturer,
		description: sauceObject.description,
		mainPepper: sauceObject.mainPepper,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
		heat: sauceObject.heat,
		likes: 0,
		dislikes: 0,
		usersLiked: sauceObject.usersLiked,
		usersDisliked: sauceObject.usersDisliked,
	});
	sauce
		.save()
		.then(() => {
			res.status(201).json({ message: "Objet enregistré !" });
		})
		.catch((error) => {
			res.status(401).json({ error });
		});
};

exports.modifySauce = (req, res, next) => {
	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };

	delete sauceObject._userId;
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			if (sauce.userId != req.auth.userId) {
				res.status(403).json({ error: "unauthorized request" });
			} else {
				Sauce.updateOne(
					{ _id: req.params.id },
					{ ...sauce, _id: req.params.id }
				)
					.then(() => res.status(200).json({ message: "Objet modifié!" }))
					.catch((error) => res.status(401).json({ error }));
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			if (sauce.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				const filename = sauce.imageUrl.split("/images/")[1];
				fs.unlink(`images/${filename}`, () => {
					Sauce.deleteOne({ _id: req.params.id })
						.then(() => {
							res.status(200).json({ message: "Objet supprimé !" });
						})
						.catch((error) => res.status(401).json({ error }));
				});
			}
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => res.status(200).json(sauce))
		.catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
	Sauce.find()
		.then((sauces) => res.status(200).json(sauces))
		.catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {};
