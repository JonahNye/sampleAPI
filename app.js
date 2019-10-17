"use strict";
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

//routes requirement here
const booksRoutes = require('./api/routes/books');
const usersRoutes = require('./api/routes/users');

mongoose.connect(`mongodb+srv://jonahnye94:${process.env.MONGO_ATLAS_PW}@trainingapibuild-ffxz2.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true});



//for easy view of request statuses
app.use(morgan('dev'));

app.use(bodyParser.json());

app.use((req, res, next) => { //funnel all requests through this filter
    res.header("Access-Control-Allow-Origin", "*"); //allow all origins. no need for cors
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); //which headers are okay?

    if (req.method ===  'OPTIONS') { //only allow these methods to be used
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next();
});


//use custom routes here ************
app.use('/books', booksRoutes);
app.use('/users', usersRoutes);

//catches all routes w/wrong endpoints that missed previous routes
app.use((req, res, next) => { //have errors after al endpoints
    const error = new Error('Not found'); //use error object
    error.status= 404;
    next(error);
})

//tell app there wasn't a problem in the routes, but a db error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({message: error.message})
});

module.exports = app;