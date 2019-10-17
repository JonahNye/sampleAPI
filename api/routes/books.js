const express = require('express');
const router = express.Router();

const bookController = require('../controllers/books');


router.get("/", bookController.get_all);

router.get("/:bookTitle", bookController.get_by_title);

router.post("/addBook", bookController.add_book);

router.patch("/checkOut/:bookId", bookController.checkout_book);


module.exports = router;