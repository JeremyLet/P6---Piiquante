const multer = require("multer");

const MIME_TYPES = {
	"image/jpg": "jpg",
	"image/jpeg": "jpg",
	"image/png": "png",
};

let today = new Date().toJSON().slice(0, 10).replace(/-/g, "-");

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "images");
	},
	filename: (req, file, callback) => {
		console.log(req.file);
		const name = file.originalname
			.split(" ")
			.join("_")
			.replace(/\.[^\/.]+$/, "");
		const extension = MIME_TYPES[file.mimetype];
		callback(null, name + "_" + today + "." + extension);
	},
});

module.exports = multer({ storage: storage }).single("image");
