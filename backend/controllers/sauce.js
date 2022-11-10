/** Getting the Sauce Models and requiring the module to delete elements */

const Sauce = require("../models/Sauce");
const fs = require("fs");

/** Function to create a Sauce */

exports.createSauce = (req, res, next) => {
	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	delete sauceObject.userId;
	const sauce = new Sauce({
		...sauceObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
		likes: 0,
		dislikes: 0,
		usersLiked: [],
		usersDisliked: [],
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

/** Function to modify a Sauce */

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
					{ ...sauceObject, _id: req.params.id, userId: req.auth.userId }
				)
					.then(() => {
						if (req.file) {
							const filename = sauce.imageUrl.split("/images/")[1];
							fs.unlink(
								`images/${filename}`,
								(error) => error && console.log("delete:" + error)
							);
						}
						res.status(200).json({ message: "Objet modifié!" });
					})
					.catch((error) => res.status(401).json({ error }));
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

/** Function to delete a Sauce */

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			if (sauce.userId != req.auth.userId) {
				res.status(403).json({ message: "unauthorized request" });
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

/** Function to display and get one Sauce */

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => res.status(200).json(sauce))
		.catch((error) => res.status(404).json({ error }));
};

/** Function to display and get all Sauces */

exports.getAllSauces = (req, res, next) => {
	Sauce.find()
		.then((sauces) => res.status(200).json(sauces))
		.catch((error) => res.status(400).json({ error }));
};

/** Function for LIKE, DISLIKE or NEUTRAL vote of Sauce */

exports.likeSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id }).then((sauce) => {
		const like = req.body.like;
		switch (like) {
			case -1:
				if (
					!sauce.usersDisliked.includes(req.auth.userId) &&
					!sauce.usersLiked.includes(req.auth.userId)
				) {
					sauce.usersDisliked.push(req.auth.userId);
				}
				break;
			case 0:
				if (sauce.usersLiked.includes(req.auth.userId)) {
					let index = sauce.usersLiked.indexOf(req.auth.userId);
					sauce.usersLiked.splice(index, 1);
				} else if (sauce.usersDisliked.includes(req.auth.userId)) {
					let index = sauce.usersDisliked.indexOf(req.auth.userId);
					sauce.usersDisliked.splice(index, 1);
				}
				break;
			case +1:
				if (
					!sauce.usersLiked.includes(req.auth.userId) &&
					!sauce.usersDisliked.includes(req.auth.userId)
				) {
					sauce.usersLiked.push(req.auth.userId);
				}
				break;
		}
		sauce.dislikes = sauce.usersDisliked.length;
		sauce.likes = sauce.usersLiked.length;
		sauce
			.save()
			.then(() => {
				res.status(200).json({ message: "Vote pris en compte" });
			})
			.catch((error) => res.status(401).json({ error }));
	});
};
