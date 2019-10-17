"use strict";

const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    isbn: {type: Number, required: true},
    title: { type: String, required: true },
    author: { type: String, required: true },
    available: { type: Boolean, default: true}
});

module.exports = mongoose.model('Book', bookSchema);