const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');

// eslint-disable-next-line
const userSchema = require('../models/User')
const app = express();
const router = express.Router();

// GET ALL THE USER //
router.get('/users', (req, res) => {
    userSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET A USER BY firebaseUID ///
router.get('/user/uid/:id', (req, res) => {
    const firebaseUID = req.params.id
    userSchema
        .find({ firebaseUID: firebaseUID })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// POST A USER ////////
router.post('/users/add', (req, res) => {
    console.log(req.body); // Para verificar los datos que recibes
    const user = new userSchema(req.body);
    console.log(user)
    user.save()
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.error(error);
            res.status(400).json({ message: 'Error saving user', error });
        });
});

///////////////////////////
// UPDATE A USER //////
router.put('/users/put/:id', (req, res) => {
    const id = req.params.id
    const {
        userFirstName,
        userLastName,
        userName,
        userEmail,
        userPassword,
        // userAddress,
        phoneNumber,
        // userRegistrationDate,
        // lastLogin,
        userRole,
        // userAccountStatus,
        profileImageUrl,
        // firebaseUID
    } = userSchema(req.body)
    userSchema
        .updateOne({ _id: id }, {
            $set: {
                userFirstName,
                userLastName,
                userName,
                userEmail,
                userPassword,
                // userAddress,
                phoneNumber,
                // userRegistrationDate,
                // lastLogin,
                userRole,
                // userAccountStatus,
                profileImageUrl,
                // firebaseUID
            }
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/////////////////////////////////////////////////////
// UPDATE THE PASSWORD OF AN USER WITH THE UID //////
router.put('/users/put/password/:id', (req, res) => {
    const id = req.params.id
    const {
        userPassword
    } = userSchema(req.body)
    userSchema
        .updateOne({ firebaseUID: id }, {
            $set: {
                userPassword
            }
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// DELETE A USER ///////////
router.delete('/user/delete/:id', (req, res) => {
    const id = req.params.id
    userSchema
        .deleteOne({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

module.exports = router;