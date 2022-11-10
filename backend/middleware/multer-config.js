/** Implementing Multer and definition of img catalog */

const multer = require("multer");

const MIME_TYPES = {
	"image/jpg": "jpg",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

/** Function to create the date of the day for pushing the data in the img name file*/

let today = new Date().toJSON().slice(0, 10).replace(/-/g, "-");

/** Setting of the Multer module */

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "images");
	},
	filename: (req, file, callback) => {
		const name = file.originalname
			.split(" ")
			.join("_")
			.replace(/\.[^\/.]+$/, "");
		const extension = MIME_TYPES[file.mimetype];
		callback(null, name + "_" + today + "." + extension);
	},
});

module.exports = multer({ storage: storage }).single("image");
