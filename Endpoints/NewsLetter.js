const express = require('express')

// eslint-disable-next-line
const NewsLetterSchema = require('../models/NewsLetter')
const app = express();
const router = express.Router();

///////////////////////////

// GET ALL THE EMAILS //
router.get('/newsletter/emails', (req, res) => {
    NewsLetterSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

// POST A Email ////////
router.post('/newsletter/emails/add', (req, res) => {
    const email = NewsLetterSchema(req.body)
    email
        .save()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

module.exports = router;