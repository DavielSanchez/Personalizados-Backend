const express = require('express')

// eslint-disable-next-line
const reviewsSchema = require('./models/Reviews')
const app = express();
const router = express.Router();

function capitalize(text) {
    const firstLetter = text.charAt(0);
    const rest = text.slice(1);
    return firstLetter.toUpperCase() + rest;
}

const options = {
    page: 1,
    limit: 3,
    collation: {
        locale: 'en'
    },
}

// GET ALL THE REVIEWS ////
router.get('/reviews', (req, res) => {
    reviewsSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET REVIEW BY PRODUCT ID //
router.get('/reviews/:productId', (req, res) => {
    const { limit, page } = req.query
    const id = req.params.productId
    reviewsSchema
        .paginate({
            productId: id
        }, {
            limit: limit,
            page: page
        }, (err, docs) => {
            res.json({
                docs
            })
        })

})

///////////////////////////
// POST A REVIEW ////////
router.post('/reviews/add', (req, res) => {
    const review = reviewsSchema(req.body)
    review
        .save()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/* /////////////////////////// 
// DELETE A REVIEW ///////////
router.delete('/reviews/delete/:id', (req, res) => {
    const id = req.params.id
    reviewsSchema
        .deleteOne({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
 */

module.exports = router;