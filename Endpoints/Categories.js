const express = require('express')

// eslint-disable-next-line
const categoriesSchema = require('./models/Categories')
const app = express();
const router = express.Router();

function capitalize(text) {
    const firstLetter = text.charAt(0);
    const rest = text.slice(1);
    return firstLetter.toUpperCase() + rest;
}

// GET ALL THE CATEGORIES //
router.get('/categories', (req, res) => {
    categoriesSchema
        .find()
        .then((data) => {
            console.log("Watching")
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET CATEGOGORY BY NAME //
router.get('/categories/:categoryName', (req, res) => {
    const PARAMS = capitalize(req.params.categoryName)
    categoriesSchema
        .find({
            'categoryName': PARAMS
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET CATEGOGORY BY TAG //
router.get('/categories/tag/:categoryTag', (req, res) => {
    categoriesSchema
        .find({
            'categoryTag': `${req.params.categoryTag}`
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET A CATEGORY BY ID ///
router.get('/categories/id/:id', (req, res) => {
    const id = req.params.id
    categoriesSchema
        .find({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// POST A CATEGORY ////////
router.post('categories/add', (req, res) => {
    const category = categoriesSchema(req.body)
    category
        .save()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// UPDATE A CATEGORY //////
router.put('/categories/put/:id', (req, res) => {
    const id = req.params.id
    const {
        categoryName,
        categoryTag,
        categoryImage
    } = categoriesSchema(req.body)
    categoriesSchema
        .updateOne({ _id: id }, {
            $set: {
                categoryName,
                categoryTag,
                categoryImage
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
// DELETE A CAR ///////////
router.delete('/categories/delete/:id', (req, res) => {
        const id = req.params.id
        categoriesSchema
            .deleteOne({ _id: id })
            .then((data) => {
                res.json(data)
            })
            .catch((error) => {
                console.error(error)
            })
    })
    ///////////////////////////

module.exports = router;