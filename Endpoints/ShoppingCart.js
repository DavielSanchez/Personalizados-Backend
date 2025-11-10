const express = require('express');
const shoppingCartSchema = require('../models/ShoppingCart');
const router = express.Router();
const ensureCartExists = async(req, res, next) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "User ID es obligatorio." });
    }

    let cart = await shoppingCartSchema.findOne({ userId });
    if (!cart) {
        cart = new shoppingCartSchema({ userId, products: [] });
        await cart.save();
    }

    req.cart = cart;
    next();
};


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
router.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId
    shoppingCartSchema
        .find({ userId: userId })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.error(error)
        })
})

// router.post('/cart/add', ensureCartExists, async(req, res) => {
//     const { productId, productName, productColor, productImage, productSize, productQuantity, productPrice } = req.body;
//     const cart = req.cart;
//     console.log(req.body)

//     const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);
//     if (existingProductIndex >= 0) {
//         cart.products[existingProductIndex].productQuantity += productQuantity;
//     } else {
//         cart.products.push({ productId, productName, productColor, productImage, productSize, productQuantity, productPrice });
//     }

//     await cart.save();
//     res.json(cart);
// });


// ADD A PRODUCT TO A CART
router.post('/cart/add', async(req, res) => {
    const {
        userId,
        productId,
        productName,
        productColor,
        productImage,
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
                products: [{ productId, productName, productColor, productImage, productSize, productQuantity, productPrice }]
            });
        } else {
            // Check if the product already exists in the cart
            const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);
            if (existingProductIndex >= 0) {
                // Update quantity if product exists
                cart.products[existingProductIndex].productQuantity += productQuantity;
            } else {
                // Add a new product to the cart
                cart.products.push({ productId, productName, productColor, productImage, productSize, productQuantity, productPrice });
            }
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: 'Error adding product to cart', error });
    }
});


// LESS QUANTITY
router.post('/cart/quantity/moreorless', async(req, res) => {
    const { userId, productId, productQuantity } = req.body;

    // Validar datos requeridos
    if (!userId || !productId || productQuantity == null) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Validar que la cantidad sea válida
    if (productQuantity < 0) {
        return res.status(400).json({ message: 'La cantidad no puede ser negativa' });
    }

    try {
        // Buscar el carrito por usuario
        let cart = await shoppingCartSchema.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado para este usuario' });
        }

        // Buscar el índice del producto en el carrito
        const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (existingProductIndex === -1) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Actualizar la cantidad del producto o eliminarlo si llega a 0
        if (productQuantity === 0) {
            cart.products.splice(existingProductIndex, 1); // Eliminar producto
        } else {
            cart.products[existingProductIndex].productQuantity = productQuantity;
        }

        // Guardar los cambios en el carrito
        await cart.save();
        res.status(200).json({ message: 'Carrito actualizado', cart });
    } catch (error) {
        console.error("Error al actualizar el carrito:", error);
        res.status(500).json({ message: 'Error al actualizar el carrito', error });
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

// DELETE A PRODUCT FROM CART
router.delete('/cart/remove-product', async(req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: 'User ID and Product ID are required.' });
    }
    try {
        const cart = await shoppingCartSchema.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        const productIndex = cart.products.findIndex(product => product._id.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }
        cart.products.splice(productIndex, 1);
        cart.numberOfProducts = cart.products.reduce((total, product) => total + product.productQuantity, 0);
        cart.totalPrice = cart.products.reduce((total, product) => total + product.productPrice * product.productQuantity, 0);
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while removing the product from the cart.' });
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