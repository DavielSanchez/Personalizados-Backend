const express = require('express');
const router = express.Router();
const storeProductsController = require('../../controllers/store/productsController');

router.get('/', storeProductsController.getAllProducts);
router.get('/search/:query', storeProductsController.searchProducts);
router.get('/price-range', storeProductsController.getByPriceRange);
router.get('/tag/:productTag', storeProductsController.getByTag);
router.get('/id/:id', storeProductsController.getById);
router.get('/category/:category', storeProductsController.getByCategory);
router.get('/category/:category/:query', storeProductsController.getByCategoryAndQuery);
router.get('/offer/:bool', storeProductsController.getByOffer);

module.exports = router;