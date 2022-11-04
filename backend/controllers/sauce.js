const Sauce = require("../models/Sauce");
const fs = require("fs");

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

exports.likeSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id }).then((sauce) => {
		if (sauce.userId != req.auth.userId) {
			res.status(403).json({ error: "unauthorized request" });
		} else {
			const like = req.body.like;
			switch (like) {
				case -1:
					sauce.dislikes++;
					sauce.usersDisliked.push(sauce.userId);
					break;
				case 0:
					sauce.dislikes = 0;
					sauce.usersDisliked.splice(sauce.userId);
					sauce.likes = 0;
					sauce.usersLiked.splice(sauce.userId);
					break;
				case +1:
					sauce.likes++;
					sauce.usersLiked.push(sauce.userId);
					break;
			}
			sauce
				.save()
				.then(() => {
					res.status(200).json({ message: "Vote pris en compte" });
				})
				.catch((error) => res.status(401).json({ error }));
		}
	});
};
