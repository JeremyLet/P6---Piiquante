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
	const like = req.body.like;
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			switch (like) {
				/* DISLIKE DE LA SAUCE */

				case -1:
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							$inc: { dislikes: 1 },
							$push: { usersDisliked: req.auth.userId },
						}
					)
						.then(() => {
							res.status(201).json({ message: "Sauce dislikée !" });
						})
						.catch((error) => res.status(401).json({ error }));
					break;

				/* LIKE DE LA SAUCE */

				case 1:
					Sauce.updateOne(
						{ _id: req.params.id },
						{
							$inc: { likes: 1 },
							$push: { usersLiked: req.auth.userId },
						}
					)
						.then(() => {
							res.status(201).json({ message: "Sauce likée !" });
						})
						.catch((error) => res.status(401).json({ error }));
					break;

				/* JE RETIRE MON LIKE OU DISLIKE */

				case 0:
					if (sauce.usersLiked.includes(req.auth.userId)) {
						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { likes: -1 },
								$pull: { usersLiked: req.auth.userId },
							}
						)
							.then(() => {
								res.status(201).json({ message: "Like retiré !" });
							})
							.catch((error) => res.status(401).json({ error }));
					}
					if (sauce.usersDisliked.includes(req.auth.userId)) {
						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { dislikes: -1 },
								$pull: { usersDisliked: req.auth.userId },
							}
						)
							.then(() => {
								res.status(201).json({ message: "Dislike retiré !" });
							})
							.catch((error) => res.status(401).json({ error }));
					}
					break;
			}
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

/* ANCIENNE STRUCTURE DE LIKE (à voir avec Pierre ?) */

// exports.likeSauce = (req, res, next) => {
// 	Sauce.findOne({ _id: req.params.id }).then((sauce) => {
// 		const like = req.body.like;
// 		switch (like) {
// 			case -1:
// 				sauce.usersDisliked.push(req.auth.userId);
// 				console.log("Je dislike");
// 				break;
// 			case 0:
// 				if (sauce.usersLiked.includes(req.auth.userId)) {
// 					sauce.usersLiked.splice(req.auth.userId);
// 					console.log("Je retire mon like");
// 				} else if (sauce.usersDisliked.includes(req.auth.userId)) {
// 					sauce.usersDisliked.splice(req.auth.userId);
// 					console.log("Je retire mon dislike");
// 				} else {
// 					console.log("Aucun vote enregistré, historique de vote neutre");
// 				}
// 				break;
// 			case +1:
// 				sauce.usersLiked.push(req.auth.userId);
// 				console.log("Je like");
// 				break;
// 		}
// 		sauce.dislikes = sauce.usersDisliked.length;
// 		sauce.likes = sauce.usersLiked.length;
// 		sauce
// 			.save()
// 			.then(() => {
// 				res
// 					.status(200)
// 					.json({ message: "Vote pris en compte pour votre sauce" });
// 			})
// 			.catch((error) => res.status(401).json({ error }));
// 	});
// };

/* FIN DE L'ANCIENNE STRUCTURE */
