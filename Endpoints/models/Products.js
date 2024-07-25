const { default: mongoose, Schema } = require("mongoose")

const productsSchema = mongoose.Schema({
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productTag: { type: String, required: true },
    productColors: { type: Array, required: false },
    productSummary: { type: String, required: true },
    productDescription: { type: String, required: true },
    productImages: { type: Array, required: true },
    productStock: { type: Number, required: true, default: 0 },
    productOffer: { type: Boolean, required: true, default: false },
    productDiscount: { type: Number, required: true, default: 0 },
    productCategory: { type: Schema.Types.ObjectId, ref: 'Categories' }
})

module.exports = mongoose.model('Products', productsSchema, 'Products')