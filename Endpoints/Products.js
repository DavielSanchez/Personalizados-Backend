const express = require('express')

// eslint-disable-next-line
const productsSchema = require('./models/Products')
const app = express();
const router = express.Router();

function capitalize(text) {
    const firstLetter = text.charAt(0);
    const rest = text.slice(1);
    return firstLetter.toUpperCase() + rest;
}

// GET ALL THE PRODUCTS //
router.get('/products', (req, res) => {
    productsSchema
        .find()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET PRODUCT BY NAME //
router.get('/products/:productName', (req, res) => {
    const PARAMS = capitalize(req.params.productName)
    productsSchema
        .find({
            'productName': PARAMS
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET PRODUCT BY PRICE //
router.get('/products/price-range', (req, res) => {
    const { minPrice, maxPrice } = req.query
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    productsSchema
        .find({
            productPrice: { $gte: min, $lte: max }
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////

///////////////////////////
// GET PRODUCT BY TAG //
router.get('/products/tag/:productTag', (req, res) => {
    productsSchema
        .find({
            'productTag': `${req.params.productTag}`
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// GET A PRODUCT BY ID ///
router.get('/products/id/:id', (req, res) => {
    const id = req.params.id
    productsSchema
        .find({ _id: id })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/////////////////////////////////
// GET A PRODUCT BY CATEGORY ///
router.get('/products/category/:category', (req, res) => {
    const Category = req.params.category
    productsSchema
        .find({
            'productPrice': `${Category}`
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

/////////////////////////////////
// GET A PRODUCT BY OFFER ///
router.get('/products/offer', (req, res) => {
    productsSchema
        .find({ "productOffer": false })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// POST A PRODUCT ////////
router.post('/products/add', (req, res) => {
    const product = productsSchema(req.body)
    product
        .save()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

///////////////////////////
// UPDATE A PRODUCT //////
router.put('/products/put/:id', (req, res) => {
    const id = req.params.id
    const {
        productName,
        productPrice,
        productTag,
        productColors,
        productSummary,
        productDescription,
        productImages,
        productStock,
        productOffer,
        productDiscount,
        productCategory,
        productComment
    } = productsSchema(req.body)
    productsSchema
        .updateOne({ _id: id }, {
            $set: {
                productName,
                productPrice,
                productTag,
                productColors,
                productSummary,
                productDescription,
                productImages,
                productStock,
                productOffer,
                productDiscount,
                productCategory,
                productComment
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
// DELETE A PRODUCT ///////////
router.delete('/products/delete/:id', (req, res) => {
    const id = req.params.id
    productsSchema
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