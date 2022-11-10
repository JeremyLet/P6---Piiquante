/** Creating the User router */
/* Firstly : Calling Express router module and User controler */
/* Secondly : Defining each route for each action possible (Signup and Login) */

const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
