const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");
//begin checkout process. requires email and password. In my spare time I'll add a way to update the users "shelf" property to include the book they checked out. For now this request only "scans" and test if their library card is valid
exports.scan_card = (req, res, next) => {

    User.find( {email: req.body.email} )
        .exec()
        .then(user => {
            
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result)=> {
                
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (result) {
                    return res.status(200).json({
                        message: "Library card successfully scanned"
                    });
                }
                res.status(401).json({
                    message: "Auth failed"
                });
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
        });
}

//add a user. RESTRICTIONS: only unique emails, must live in Southfield. See model for other neccesarry properties
exports.sign_up = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "A user with this email already exists"
                });
            }
            let cityTest = req.body.city.toLowerCase();
            if (cityTest != 'southfield') {
                return res.status(409).json({
                    message: "Only residents of Southfield can carry a SF Library Card"
                })
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        console.log(hash);
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            fName: req.body.fName,
                            lName: req.body.lName,
                            city: cityTest
                        });
                        console.log(user.password);

                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created"
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    };
                });
            };
        });
}

//removes user by id
exports.revoke_card = (req, res, next) => {
    User.remove( {_id: req.params.userId} )
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Library card revoked"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.get_card_holders = (req, res, next) => {
    User.find()
        .select("_id email password fName lName city shelf") //showing pw for dev purposes
        .exec()
        .then(docs => {
            res.status(200).json({
                total_card_holders: docs.length,
                card_holders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        email: doc.email,
                        password: doc.password,
                        fName: doc.fName,
                        lName: doc.lName,
                        city: doc.city,
                        shelf: doc.shelf
                    };
                })
        })
})
.catch(err => {
    res.status(500).json({
        error: err
    });
});

}