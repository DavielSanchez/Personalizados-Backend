const express = require('express')

// eslint-disable-next-line
const shoppingCartSchema = require('./models/ShoppingCart')
const app = express();
const router = express.Router();

function capitalize(text) {
    const firstLetter = text.charAt(0);
    const rest = text.slice(1);
    return firstLetter.toUpperCase() + rest;
}


// GET ALL THE ShoppingCarts ////
router.get('/cart', (req, res) => {
    shoppingCartSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET REVIEW BY CART ID //
router.get('/cart/:id', (req, res) => {
    const id = req.params.id
    shoppingCartSchema
        .find({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// POST A REVIEW ////////
router.post('/cart/add', (req, res) => {
    const cart = shoppingCartSchema(req.body)
    cart
        .save()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/////////////////////////// */
// DELETE A REVIEW ///////////
router.delete('/reviews/delete/:id', (req, res) => {
    const id = req.params.id
    shoppingCartSchema
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