const express = require('express')

// eslint-disable-next-line
const productsSchema = require('./models/Products')
const categorySchema = require('./models/Categories')

const app = express();
const router = express.Router();

function capitalize(text) {
    if (!text || typeof text !== 'string') {
        return ''; // Devuelve una cadena vacía si el texto es inválido
    }
    const firstLetter = text.charAt(0).toUpperCase();
    const restOfText = text.slice(1).toLowerCase();
    return firstLetter + restOfText;
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
// GET ALL THE PRODUCT BY CATEGORY ///
router.get('/products/category/:category', async(req, res) => {
    const category = req.params.category; // Nombre de la categoría
    const { limit = 10, page = 1, priceRange, search = '' } = req.query; // Parámetros de consulta
    let priceFilter = {};

    // Validar rango de precios
    if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            priceFilter = {
                productPrice: { $gte: minPrice, $lte: maxPrice }
            };
        } else {
            return res.status(400).json({ message: "Formato de rango de precios no válido" });
        }
    }

    try {
        // Buscar productos que coincidan con la categoría y otros filtros
        const products = await productsSchema.find({
                $and: [
                    { productCategory: category }, // Filtro por categoría
                    {
                        $or: [ // Búsqueda por nombre, etiqueta o resumen
                            { productName: { $regex: search, $options: "i" } },
                            { productTag: { $regex: search, $options: "i" } },
                            { productSummary: { $regex: search, $options: "i" } }
                        ]
                    },
                    priceFilter // Filtro por rango de precios
                ]
            })
            .skip((page - 1) * limit) // Paginación
            .limit(Number(limit)); // Límite de productos por página

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al buscar productos", error });
    }
});

/////////////////////////////////
// GET A PRODUCT BY CATEGORY ///
router.get('/products/category/:category/:query', async(req, res) => {
    const PARAMS = capitalize(req.params.query);
    const category = req.params.category;
    const priceRange = req.query.priceRange;
    const limit = parseInt(req.query.limit) || 10; // Límite de productos por página (valor por defecto 10)
    const page = parseInt(req.query.page) || 1; // Página actual (valor por defecto 1)

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
            productCategory: category
        });

        const products = await productsSchema.find({
                $and: [
                    { productName: { $regex: PARAMS, $options: "i" } },
                    {
                        $or: [
                            { productName: { $regex: PARAMS, $options: "i" } },
                            { productTag: { $regex: PARAMS, $options: "i" } },
                            { productSummary: { $regex: PARAMS, $options: "i" } }
                        ]
                    },
                    priceFilter
                ]
            })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en la búsqueda" });
    }
});

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