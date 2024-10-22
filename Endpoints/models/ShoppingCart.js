const { default: mongoose, Schema } = require("mongoose");

const shoppingCartSchema = mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    totalPrice: { type: Number, required: false },
    numberOfProducts: { type: Number, required: false },
    products: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Products' },
        productColor: { type: String, required: false },
        productSize: { type: String, required: false },
        productQuantity: { type: Number, required: false, default: 1 },
        productPrice: { type: Number, required: true }
    }]
});


shoppingCartSchema.pre('save', function(next) {
    this.numberOfProducts = this.products.reduce((total, product) => total + product.productQuantity, 0);
    this.totalPrice = this.products.reduce((total, product) => total + product.productPrice * product.productQuantity, 0);

    next();
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema, 'ShoppingCart');