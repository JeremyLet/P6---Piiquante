/** Creating the Sauce router */
/* Firstly => Calling : Express router, Multer config, Auth Config and Sauce controler */
/* Secondly => Defining each route */
/*
Routes : 
*
* Getting ALL Sauces
* Creating a Sauce
* Getting ONE Sauce
* Modify a Sauce
* Deleting a Sauce
* Liking / Disliking a Sauce
*
*/

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const sauceCtrl = require("../controllers/sauce");

router.get("/", auth, sauceCtrl.getAllSauces);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
