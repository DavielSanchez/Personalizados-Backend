const Product = require('../../models/Products');
const { generateUniqueBarcode } = require('../../utils/barcodeGenerator');
const {generateProductSKU, generateVariantSKU} = require('../../utils/skuGenerator');
const { generateUniqueSlug } = require('../../utils/slugGenerator');

exports.getAllProducts = async(req, res) => {
    try {
        const {
            page = 1,
                limit = 20,
                search,
                status,
                category,
                minStock,
                maxStock,
                sortBy = 'createdAt',
                sortOrder = 'desc'
        } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { productTag: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            filter.status = status;
        }
        if (category) {
            filter.productCategory = category;
        }
        if (minStock || maxStock) {
            filter.productStock = {};
            if (minStock) filter.productStock.$gte = parseInt(minStock);
            if (maxStock) filter.productStock.$lte = parseInt(maxStock);
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const products = await Product.find(filter)
            .populate('productCategory', 'categoryName categoryImage')
            .populate('createdBy', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(filter);

        res.json({
            products,
            pagination: {
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            },
            filters: {
                search,
                status,
                category,
                minStock,
                maxStock
            }
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({
            message: "Error al obtener productos",
            error: error.message
        });
    }
};

exports.searchProducts = async(req, res) => {
    try {
        const {
            query,
            category,
            status = 'active',
            inStock = 'true',
            page = 1,
            limit = 20
        } = req.query;

        let filter = {
            status: status
        };
        if (query) {
            filter.$or = [
                { productName: { $regex: query, $options: 'i' } },
                { sku: { $regex: query, $options: 'i' } },
                { productTag: { $regex: query, $options: 'i' } },
                { 'metaKeywords': { $in: [new RegExp(query, 'i')] } }
            ];
        }
        if (category) {
            filter.productCategory = category;
        }
        if (inStock === 'true') {
            filter.productStock = { $gt: 0 };
        } else if (inStock === 'false') {
            filter.productStock = 0;
        }

        const products = await Product.find(filter)
            .populate('productCategory', 'categoryName')
            .select('productName sku productPrice productStock status productMainImage productCategory')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ productName: 1 });

        const total = await Product.countDocuments(filter);

        res.json({
            products,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
            message: "Error en la búsqueda",
            error: error.message
        });
    }
};

exports.getProductById = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('productCategory', 'categoryName categoryImage categoryTag')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const productObj = product.toObject();
        productObj.profitMargin = product.profitMargin;
        productObj.isLowStock = product.checkLowStock();

        res.json(productObj);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({
            message: "Error al obtener el producto",
            error: error.message
        });
    }
};

exports.createProduct = async(req, res) => {
    try {
        const productData = {
            ...req.body,
            createdBy: req.user?.id,
            updatedBy: req.user?.id
        };

        if (!productData.sku) {
            productData.sku = await generateProductSKU(productData.productName);
        }

        if (!productData.slug && productData.productName) {
            productData.slug = await generateUniqueSlug(productData.productName);
        }

        if (!productData.barcode) {
            productData.barcode = await generateUniqueBarcode();
        }

        if (productData.variants && productData.variants.length > 0) {
            productData.variants = await Promise.all(
                productData.variants.map(async (variant, index) => {
                    if (!variant.sku) {
                        variant.sku = await generateVariantSKU(
                            productData.productName, 
                            variant.color, 
                            variant.size, 
                            index + 1
                        );
                    }
                    return variant;
                })
            );
        }



        const product = new Product(productData);
        await product.save();
        await product.populate('productCategory', 'categoryName');
        res.status(201).json({
            message: "Producto creado exitosamente",
            product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            message: "Error al crear el producto",
            error: error.message
        });
    }
};

exports.updateProduct = async(req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user?.id,
            updatedAt: Date.now()
        };

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData, { new: true, runValidators: true }
        ).populate('productCategory', 'categoryName');

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({
            message: "Producto actualizado exitosamente",
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({
            message: "Error al actualizar el producto",
            error: error.message
        });
    }
};

exports.updateStock = async(req, res) => {
    try {
        const { stock, operation = 'set' } = req.body;

        let updateQuery = {};

        switch (operation) {
            case 'increment':
                updateQuery = { $inc: { productStock: stock } };
                break;
            case 'decrement':
                updateQuery = { $inc: { productStock: -stock } };
                break;
            default:
                updateQuery = { $set: { productStock: stock } };
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id, {
                ...updateQuery,
                updatedBy: req.user?.id,
                updatedAt: Date.now()
            }, { new: true }
        ).select('productName sku productStock minStock lowStockAlert');

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Verificar si ahora está en low stock
        const isLowStock = product.checkLowStock();
        if (isLowStock && !product.lowStockAlert) {
            await Product.findByIdAndUpdate(req.params.id, { lowStockAlert: true });
        }

        res.json({
            message: "Stock actualizado exitosamente",
            product: {
                ...product.toObject(),
                isLowStock
            }
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(400).json({
            message: "Error al actualizar el stock",
            error: error.message
        });
    }
};

// UPDATE PRODUCT STATUS - CRM (cambiar status)
exports.updateStatus = async(req, res) => {
    try {
        const { status } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id, {
                status,
                updatedBy: req.user?.id,
                updatedAt: Date.now()
            }, { new: true }
        ).select('productName sku status');

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({
            message: `Producto ${status} exitosamente`,
            product
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(400).json({
            message: "Error al actualizar el estado",
            error: error.message
        });
    }
};

// DELETE PRODUCT - CRM (soft delete con status)
exports.deleteProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, {
                status: 'archived',
                updatedBy: req.user?.id,
                updatedAt: Date.now()
            }, { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({
            message: "Producto archivado exitosamente",
            product: {
                _id: product._id,
                productName: product.productName,
                sku: product.sku,
                status: product.status
            }
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            message: "Error al archivar el producto",
            error: error.message
        });
    }
};

// GET PRODUCT ANALYTICS - CRM (estadísticas)
exports.getProductAnalytics = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .select('productName sku views salesCount wishlistCount createdAt');

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const analytics = {
            basic: {
                views: product.views,
                sales: product.salesCount,
                wishlist: product.wishlistCount,
                daysSinceCreation: Math.floor((Date.now() - product.createdAt) / (1000 * 60 * 60 * 24))
            },
            performance: {
                conversionRate: product.views > 0 ? ((product.salesCount / product.views) * 100).toFixed(2) : 0,
                popularityScore: (product.views * 0.3 + product.salesCount * 0.5 + product.wishlistCount * 0.2)
            }
        };

        res.json(analytics);
    } catch (error) {
        console.error('Error getting product analytics:', error);
        res.status(500).json({
            message: "Error al obtener analytics del producto",
            error: error.message
        });
    }
};

exports.getTopSellingProducts = async(req, res) => {
    try {
        const { limit = 10, period = 'all' } = req.query;
        
        let dateFilter = {};
        
        // Filtros por período
        if (period === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (period === 'week') {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - 7);
            dateFilter = { createdAt: { $gte: startOfWeek } };
        }

        const topProducts = await Product.find({
            ...dateFilter,
            status: 'active',
            salesCount: { $gt: 0 }
        })
        .select('productName sku productPrice productMainImage salesCount views wishlistCount productStock')
        .sort({ salesCount: -1 })
        .limit(parseInt(limit))
        .populate('productCategory', 'categoryName');

        res.json({
            period,
            topProducts: topProducts.map(product => ({
                _id: product._id,
                productName: product.productName,
                sku: product.sku,
                productPrice: product.productPrice,
                productMainImage: product.productMainImage,
                salesCount: product.salesCount,
                views: product.views,
                wishlistCount: product.wishlistCount,
                productStock: product.productStock,
                category: product.productCategory?.categoryName,
                conversionRate: product.views > 0 ? ((product.salesCount / product.views) * 100).toFixed(2) : 0
            }))
        });
    } catch (error) {
        console.error('Error getting top selling products:', error);
        res.status(500).json({
            message: "Error al obtener productos más vendidos",
            error: error.message
        });
    }
};

exports.getProductsStats = async(req, res) => {
    try {
        const [
            totalProducts,
            activeProducts,
            outOfStockProducts,
            lowStockProducts,
            draftProducts,
            totalSales,
            mostViewedProduct,
            highestRatedProduct
        ] = await Promise.all([
            // Total productos
            Product.countDocuments(),
            // Productos activos
            Product.countDocuments({ status: 'active' }),
            // Sin stock
            Product.countDocuments({ productStock: 0, status: 'active' }),
            // Stock bajo
            Product.countDocuments({ 
                productStock: { $lte: { $min: ['$minStock', 10] } },
                status: 'active' 
            }),
            // Borradores
            Product.countDocuments({ status: 'draft' }),
            // Total ventas
            Product.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: null, totalSales: { $sum: '$salesCount' } } }
            ]),
            // Producto más visto
            Product.findOne({ status: 'active' })
                .sort({ views: -1 })
                .select('productName views productMainImage'),
            // Producto con más ventas
            Product.findOne({ status: 'active' })
                .sort({ salesCount: -1 })
                .select('productName salesCount productMainImage')
        ]);

        const stats = {
            overview: {
                totalProducts,
                activeProducts,
                outOfStock: outOfStockProducts,
                lowStock: lowStockProducts,
                draftProducts,
                totalSales: totalSales[0]?.totalSales || 0
            },
            highlights: {
                mostViewed: mostViewedProduct ? {
                    productName: mostViewedProduct.productName,
                    views: mostViewedProduct.views,
                    image: mostViewedProduct.productMainImage
                } : null,
                bestSeller: highestRatedProduct ? {
                    productName: highestRatedProduct.productName,
                    salesCount: highestRatedProduct.salesCount,
                    image: highestRatedProduct.productMainImage
                } : null
            },
            percentages: {
                activePercentage: ((activeProducts / totalProducts) * 100).toFixed(1),
                outOfStockPercentage: ((outOfStockProducts / activeProducts) * 100).toFixed(1),
                lowStockPercentage: ((lowStockProducts / activeProducts) * 100).toFixed(1)
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting products stats:', error);
        res.status(500).json({
            message: "Error al obtener estadísticas de productos",
            error: error.message
        });
    }
};

exports.getLowStockProducts = async(req, res) => {
    try {
        const { limit = 20, page = 1 } = req.query;
        
        const lowStockProducts = await Product.find({
            status: 'active',
            $expr: { $lte: ['$productStock', '$minStock'] }
        })
        .select('productName sku productPrice productStock minStock lowStockAlert productMainImage')
        .populate('productCategory', 'categoryName')
        .sort({ productStock: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await Product.countDocuments({
            status: 'active',
            $expr: { $lte: ['$productStock', '$minStock'] }
        });

        res.json({
            products: lowStockProducts,
            pagination: {
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting low stock products:', error);
        res.status(500).json({
            message: "Error al obtener productos con stock bajo",
            error: error.message
        });
    }
};

exports.getProductsByCategory = async(req, res) => {
    try {
        const productsByCategory = await Product.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$productCategory',
                    count: { $sum: 1 },
                    totalSales: { $sum: '$salesCount' },
                    totalViews: { $sum: '$views' },
                    averagePrice: { $avg: '$productPrice' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $project: {
                    categoryName: { $arrayElemAt: ['$categoryInfo.categoryName', 0] },
                    count: 1,
                    totalSales: 1,
                    totalViews: 1,
                    averagePrice: { $round: ['$averagePrice', 2] },
                    conversionRate: {
                        $cond: {
                            if: { $gt: ['$totalViews', 0] },
                            then: { $round: [{ $multiply: [{ $divide: ['$totalSales', '$totalViews'] }, 100] }, 2] },
                            else: 0
                        }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json(productsByCategory);
    } catch (error) {
        console.error('Error getting products by category:', error);
        res.status(500).json({
            message: "Error al obtener productos por categoría",
            error: error.message
        });
    }
};

exports.getRecentlyAddedProducts = async(req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const recentProducts = await Product.find({ status: 'active' })
            .select('productName sku productPrice productMainImage createdAt productStock')
            .populate('productCategory', 'categoryName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(recentProducts);
    } catch (error) {
        console.error('Error getting recently added products:', error);
        res.status(500).json({
            message: "Error al obtener productos recientes",
            error: error.message
        });
    }
};

exports.getProductPerformance = async(req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const performanceStats = await Product.aggregate([
            {
                $match: {
                    status: 'active',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $project: {
                    productName: 1,
                    sku: 1,
                    salesCount: 1,
                    views: 1,
                    wishlistCount: 1,
                    productPrice: 1,
                    productStock: 1,
                    conversionRate: {
                        $cond: {
                            if: { $gt: ['$views', 0] },
                            then: { $multiply: [{ $divide: ['$salesCount', '$views'] }, 100] },
                            else: 0
                        }
                    },
                    revenue: { $multiply: ['$salesCount', '$productPrice'] },
                    popularityScore: {
                        $add: [
                            { $multiply: ['$views', 0.3] },
                            { $multiply: ['$salesCount', 0.5] },
                            { $multiply: ['$wishlistCount', 0.2] }
                        ]
                    }
                }
            },
            { $sort: { popularityScore: -1 } },
            { $limit: 50 }
        ]);

        res.json(performanceStats);
    } catch (error) {
        console.error('Error getting product performance:', error);
        res.status(500).json({
            message: "Error al obtener rendimiento de productos",
            error: error.message
        });
    }
};

// BULK OPERATIONS - CRM (operaciones masivas)
exports.bulkUpdate = async(req, res) => {
    try {
        const { ids, updateData } = req.body;

        const result = await Product.updateMany({ _id: { $in: ids } }, {
            ...updateData,
            updatedBy: req.user?.id,
            updatedAt: Date.now()
        });

        res.json({
            message: `${result.modifiedCount} productos actualizados exitosamente`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(400).json({
            message: "Error en actualización masiva",
            error: error.message
        });
    }
};

exports.bulkDelete = async(req, res) => {
    try {
        const { ids } = req.body;

        const result = await Product.updateMany({ _id: { $in: ids } }, {
            status: 'archived',
            updatedBy: req.user?.id,
            updatedAt: Date.now()
        });

        res.json({
            message: `${result.modifiedCount} productos archivados exitosamente`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(400).json({
            message: "Error en archivo masivo",
            error: error.message
        });
    }
};