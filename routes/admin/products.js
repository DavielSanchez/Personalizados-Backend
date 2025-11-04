const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/admin/productsController');

router.get('/', productsController.getAllProducts);
router.get('/search', productsController.searchProducts);
router.get('/:id', productsController.getProductById);
router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.patch('/:id/stock', productsController.updateStock);
router.patch('/:id/status', productsController.updateStatus);
router.delete('/:id', productsController.deleteProduct);
router.get('/:id/analytics', productsController.getProductAnalytics);
router.get('/analytics/top-selling', productsController.getTopSellingProducts);
router.get('/analytics/stats', productsController.getProductsStats);
router.get('/analytics/low-stock', productsController.getLowStockProducts);
router.get('/analytics/by-category', productsController.getProductsByCategory);
router.get('/analytics/recent', productsController.getRecentlyAddedProducts);
router.get('/analytics/performance', productsController.getProductPerformance);
router.post('/bulk/update', productsController.bulkUpdate);
router.post('/bulk/delete', productsController.bulkDelete);

module.exports = router;