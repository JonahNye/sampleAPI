const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Book = require("../models/book");

exports.get_all = (req, res, next) => {
    Book.find()
        .select("_id isbn title author available")
        .exec()
        .then(docs => {
            for (let book of docs) {
                book.title = book.title.split('-').join(' '); //clean up hyphens
            }
            const response = {
                totalBooks: docs.length,
                books: docs.map(doc => {
                    return {
                        _id: doc._id,
                        isbn: doc.isbn,
                        title: doc.title,
                        author: doc.author,
                        available: doc.available
                    }
                })
            }
            res.status(200).json(response);
        })

        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

//get by title: why? no one walks into a library looking for a book by that library's internal id schematic. VERY few know the isbn of the book they want. Returns 0, 1, or more with book details, and informaton on how to checkout the selected book
exports.get_by_title = (req, res, next) => {
    Book.find({title: req.params.bookTitle})
    .exec()
    .then(stack => {
        if (stack.length === 0 || !stack) {
            return res.status(404).json({
                message: "Found no book with this title"
            });
        }
        else if (stack.length === 1) {
            return res.status(200).json({
                message: "We found one book with this title",
                bookDetails: {
                    title: stack[0].title,
                    isbn: stack[0].isbn,
                    author: stack[0].author,
                    bookId: stack[0]._id
                },
                checkMeOut :`http://localhost:3000/books/checkOut/${stack[0]._id}`,
                checkOutFormat: `[{propName: available , value: true}]`
            })
        }
        else {
            let books = [];

            for (let book of stack) {
                let current = {
                    title: book.title,
                    isbn: book.isbn,
                    author: book.author,
                    bookId: book._id,
                    checkMeOut: `http://localhost:3000/books/checkOut/${book._id}`
                }
                books.push(current);
            }
            res.status(200).json({
                message: "We found many books with this title",
                booksFound: books,
                checkOutFormat: '[{propName: available , value: true}]'
            })
        }
    })
}

//use this to add books to test different get methods. Request body should have an author(str), title(str), and ISBN(num) properties for the request to work
exports.add_book = (req, res, next) => {
    Book.find({isbn: req.body.isbn}) //check if a duplicate of that version of a text is already in stock
        .exec()
        .then(book => {
            if (book.length >= 1) {
                return res.status(409).json({
                    message: "We can't afford duplicates"
                });
            } else {
                
                const newBook = new Book({
                    _id: new mongoose.Types.ObjectId(),
                    isbn: req.body.isbn,
                    title: req.body.title,
                    author: req.body.author
                })
                newBook.save()
                
                .then(result => {
                    res.status(201).json({
                        message: "Book added to shelves",
                        newBook: {
                            _id: result._id,
                            isbn: result.isbn,
                            title: result.title,
                            author: result.author,
                            available: result.available
                        }
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });

            };
        });
}

//use this to "checkout" a book. See the response from the get_by_title for instructions on making the request
exports.checkout_book = (req, res, next) =>{
    const id = req.params.bookId;
    const updateOps = {};
    for (let ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Book.update({ _id: id}, {$set: updateOps})
        .exec()
        .then( result => {
            res.status(200).json({
                message: 'Book checked out',
                browseMore: 'http://localhost:3000/books'
            })
        })
}