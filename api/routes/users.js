const express = require("express");
const router = express.Router();


const userController = require("../controllers/users");

//send email, password, and id of book to checkout
router.post("/scanCard", userController.scan_card);


router.post("/signUp", userController.sign_up);


router.delete("/revokeCard/:userId", userController.revoke_card);


router.get("/", userController.get_card_holders);



module.exports = router;