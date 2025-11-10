const Product = require('../../models/Products');
const Category = require('../../models/Categories');

function capitalize(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    const firstLetter = text.charAt(0).toUpperCase();
    const restOfText = text.slice(1).toLowerCase();
    return firstLetter + restOfText;
}

exports.getAllProducts = async(req, res) => {
    const { limit = 10, page = 1, priceRange, search, category, status = 'active' } = req.query;

    let priceFilter = {};
    let baseFilter = {
        status: status,
        isPublished: true
    };

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

    if (category) {
        baseFilter.productCategory = category;
    }

    if (search) {
        baseFilter.$or = [
            { productName: { $regex: search, $options: "i" } },
            { productTag: { $regex: search, $options: "i" } },
            { productSummary: { $regex: search, $options: "i" } }
        ];
    }

    try {
        const products = await Product.paginate({
            $and: [baseFilter, priceFilter]
        }, {
            limit: parseInt(limit),
            page: parseInt(page),
            populate: 'productCategory',
            select: 'productName productPrice productTag productMainImage productStock productOffer productDiscount productCategory slug sku'
        });

        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: "Error en la búsqueda de productos" });
    }
};

exports.searchProducts = async(req, res) => {
    const PARAMS = capitalize(req.params.query);
    const priceRange = req.query.priceRange;
    const { status = 'active' } = req.query;

    let priceFilter = {};
    let baseFilter = {
        status: status,
        isPublished: true
    };

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
        const categories = await Category.find({
            categoryName: { $regex: PARAMS, $options: "i" }
        });

        const categoryIds = categories.map(cat => cat._id);

        const products = await Product.find({
                $and: [
                    baseFilter,
                    {
                        $or: [
                            { productName: { $regex: PARAMS, $options: "i" } },
                            { productTag: { $regex: PARAMS, $options: "i" } },
                            { productSummary: { $regex: PARAMS, $options: "i" } },
                            { productCategory: { $in: categoryIds } }
                        ]
                    },
                    priceFilter
                ]
            })
            .populate('productCategory', 'categoryName categoryImage')
            .select('productName productPrice productTag productMainImage productStock productOffer productDiscount slug');

        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: "Error en la búsqueda" });
    }
};

exports.getByPriceRange = async(req, res) => {
    const { minPrice, maxPrice, status = 'active' } = req.query;
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    try {
        const products = await Product.find({
                productPrice: { $gte: min, $lte: max },
                status: status,
                isPublished: true
            })
            .populate('productCategory', 'categoryName')
            .select('productName productPrice productMainImage productStock productTag slug');

        res.json(products);
    } catch (error) {
        console.error('Error getting products by price range:', error);
        res.status(500).json({ message: "Error al buscar productos por precio" });
    }
};

exports.getByTag = async(req, res) => {
    const { status = 'active' } = req.query;

    try {
        const products = await Product.find({
                'productTag': { $regex: req.params.productTag, $options: 'i' },
                status: status,
                isPublished: true
            })
            .populate('productCategory', 'categoryName')
            .select('productName productPrice productMainImage productStock productTag slug');

        res.json(products);
    } catch (error) {
        console.error('Error getting products by tag:', error);
        res.status(500).json({ message: "Error al buscar productos por etiqueta" });
    }
};

exports.getById = async(req, res) => {
    const id = req.params.id;
    const { status = 'active' } = req.query;

    try {
        const product = await Product.findOne({
                _id: id,
                status: status,
                isPublished: true
            })
            .populate('productCategory', 'categoryName categoryImage categoryTag');

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        product.views += 1;
        await product.save();

        res.json(product);
    } catch (error) {
        console.error('Error getting product by id:', error);
        res.status(500).json({ message: "Error al obtener el producto" });
    }
};

exports.getByCategory = async(req, res) => {
    const category = req.params.category;
    const { limit = 10, page = 1, priceRange, search = '', status = 'active' } = req.query;

    let priceFilter = {};
    let baseFilter = {
        productCategory: category,
        status: status,
        isPublished: true
    };

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

    if (search) {
        baseFilter.$or = [
            { productName: { $regex: search, $options: "i" } },
            { productTag: { $regex: search, $options: "i" } },
            { productSummary: { $regex: search, $options: "i" } }
        ];
    }

    try {
        const products = await Product.find({
                $and: [baseFilter, priceFilter]
            })
            .populate('productCategory', 'categoryName categoryImage')
            .select('productName productPrice productTag productMainImage productStock productOffer productDiscount slug')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Product.countDocuments({
            $and: [baseFilter, priceFilter]
        });

        res.status(200).json({
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting products by category:', error);
        res.status(500).json({ message: "Error al buscar productos por categoría", error: error.message });
    }
};

exports.getByCategoryAndQuery = async(req, res) => {
    const PARAMS = capitalize(req.params.query);
    const category = req.params.category;
    const priceRange = req.query.priceRange;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const { status = 'active' } = req.query;

    let priceFilter = {};
    let baseFilter = {
        productCategory: category,
        status: status,
        isPublished: true
    };

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
        const products = await Product.find({
                $and: [
                    baseFilter,
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
            .populate('productCategory', 'categoryName categoryImage')
            .select('productName productPrice productTag productMainImage productStock productOffer productDiscount slug')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Product.countDocuments({
            $and: [
                baseFilter,
                {
                    $or: [
                        { productName: { $regex: PARAMS, $options: "i" } },
                        { productTag: { $regex: PARAMS, $options: "i" } },
                        { productSummary: { $regex: PARAMS, $options: "i" } }
                    ]
                },
                priceFilter
            ]
        });

        res.json({
            products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting products by category and query:', error);
        res.status(500).json({ message: "Error en la búsqueda" });
    }
};

exports.getByOffer = async(req, res) => {
    const offer = req.params.bool === 'true';
    const { status = 'active' } = req.query;

    try {
        const products = await Product.find({
                "productOffer": offer,
                status: status,
                isPublished: true
            })
            .populate('productCategory', 'categoryName')
            .select('productName productPrice productMainImage productStock productDiscount productTag slug');

        res.json(products);
    } catch (error) {
        console.error('Error getting products by offer:', error);
        res.status(500).json({ message: "Error al buscar productos en oferta" });
    }
};

exports.getFeaturedProducts = async(req, res) => {
    const { limit = 8, status = 'active' } = req.query;

    try {
        const products = await Product.find({
                status: status,
                isPublished: true,
                productStock: { $gt: 0 }
            })
            .populate('productCategory', 'categoryName')
            .select('productName productPrice productMainImage productStock productOffer productDiscount slug')
            .sort({ salesCount: -1, views: -1 })
            .limit(parseInt(limit));

        res.json(products);
    } catch (error) {
        console.error('Error getting featured products:', error);
        res.status(500).json({ message: "Error al obtener productos destacados" });
    }
};

exports.getRelatedProducts = async(req, res) => {
    const productId = req.params.id;
    const { limit = 4, status = 'active' } = req.query;

    try {
        const currentProduct = await Product.findById(productId)
            .select('productCategory productTag');

        if (!currentProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const relatedProducts = await Product.find({
                _id: { $ne: productId },
                productCategory: currentProduct.productCategory,
                status: status,
                isPublished: true,
                productStock: { $gt: 0 }
            })
            .populate('productCategory', 'categoryName')
            .select('productName productPrice productMainImage productStock productOffer productDiscount slug')
            .limit(parseInt(limit));

        res.json(relatedProducts);
    } catch (error) {
        console.error('Error getting related products:', error);
        res.status(500).json({ message: "Error al obtener productos relacionados" });
    }
};