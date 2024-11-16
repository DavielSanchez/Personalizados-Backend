const express = require('express');
const shoppingCartSchema = require('./models/ShoppingCart');
const router = express.Router();


// GET ALL CARTS
router.get('/cart', async(req, res) => {
    try {
        const carts = await shoppingCartSchema.find();
        res.json(carts);
    } catch (error) {
        console.error("Error retrieving carts:", error);
        res.status(500).json({ message: 'Error retrieving carts', error });
    }
});

// GET CART BY CART ID
router.get('/cart/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const cart = await shoppingCartSchema.findById(id);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).json({ message: 'Error retrieving cart', error });
    }
});

// ADD A PRODUCT TO A CART
router.post('/cart/add', async(req, res) => {
    const {
        userId,
        productId,
        productColor,
        productSize,
        productQuantity,
        productPrice
    } = req.body;
    try {
        let cart = await shoppingCartSchema.findOne({ userId });

        if (!cart) {
            // Create a new cart if none exists for the user
            cart = new shoppingCartSchema({
                userId,
                products: [{ productId, productColor, productSize, productQuantity, productPrice }]
            });
        } else {
            // Check if the product already exists in the cart
            const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);
            if (existingProductIndex >= 0) {
                // Update quantity if product exists
                cart.products[existingProductIndex].productQuantity += productQuantity;
            } else {
                // Add a new product to the cart
                cart.products.push({ productId, productColor, productSize, productQuantity, productPrice });
            }
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: 'Error adding product to cart', error });
    }
});

// UPDATE A CART BY CART ID
router.put('/cart/put/:id', async(req, res) => {
    const { id } = req.params;
    const { products } = req.body;
    try {
        const cart = await shoppingCartSchema.findByIdAndUpdate(
            id, { $set: { products } }, { new: true }
        );

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.json(cart);
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: 'Error updating cart', error });
    }
});

// DELETE A CART BY CART ID
router.delete('/cart/delete/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const result = await shoppingCartSchema.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.json({ message: 'Cart deleted successfully' });
    } catch (error) {
        console.error("Error deleting cart:", error);
        res.status(500).json({ message: 'Error deleting cart', error });
    }
});

module.exports = router;