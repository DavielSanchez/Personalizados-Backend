const express = require('express')

// eslint-disable-next-line
const productsSchema = require('./models/Products')
const categorySchema = require('./models/Categories')

const app = express();
const router = express.Router();

function capitalize(text) {
    const firstLetter = text.charAt(0);
    const rest = text.slice(1);
    return firstLetter.toUpperCase() + rest;
}

// GET ALL THE PRODUCTS //
router.get('/products', async(req, res) => {
    const { limit, page, priceRange } = req.query
    let priceFilter = {};

    if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);

        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            priceFilter = {
                productPrice: { $gte: minPrice, $lte: maxPrice }
            };
        } else {
            return res.status(400).json({ message: "Invalid price range format" });
        }
    }

    try {

        const products = await productsSchema.paginate({
            $and: [priceFilter]
        }, {
            limit: limit,
            page: page
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en la búsqueda" });
    }
});

// GET PRODUCT BY ANY FIELD //
router.get('/products/:query', async(req, res) => {
    const PARAMS = capitalize(req.params.query);
    const priceRange = req.query.priceRange;

    let priceFilter = {};

    if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);

        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            priceFilter = {
                productPrice: { $gte: minPrice, $lte: maxPrice }
            };
        } else {
            return res.status(400).json({ message: "Invalid price range format" });
        }
    }

    try {
        const categories = await categorySchema.find({
            categoryName: { $regex: PARAMS, $options: "i" }
        });


        const products = await productsSchema.find({
            $and: [{
                    $or: [
                        { productName: { $regex: PARAMS, $options: "i" } },
                        { productTag: { $regex: PARAMS, $options: "i" } },
                        { productSummary: { $regex: PARAMS, $options: "i" } }
                    ]
                },
                priceFilter
            ]
        });

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en la búsqueda" });
    }
});


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
            'productCategory': `${Category}`
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
router.get('/products/offer/:bool', (req, res) => {
    const offer = req.params.bool
    productsSchema
        .find({ "productOffer": offer })
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