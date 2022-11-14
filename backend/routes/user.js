/** Importing express and the router module */

const express = require("express");
const router = express.Router();

/** Importing the user controlers */

const userCtrl = require("../controllers/user");

/** Implementing the password validator module */

const password = require("../middleware/password");

/** Implementing the limiter module */

const limiter = require("../middleware/rate-limiter");

/** Defining the login and signup routes*/

router.post("/login", limiter, userCtrl.login);
router.post("/signup", limiter, password, userCtrl.signup);

module.exports = router;
