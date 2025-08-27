const { default: mongoose, Schema } = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2')

const productsSchema = mongoose.Schema({
    productName: { type: String, required: false },
    productPrice: { type: Number, required: false },
    productTag: { type: String, required: false },
    productColors: { type: Array, required: false },
    productSizes: { type: Array, required: false },
    productSummary: { type: String, required: false },
    productDescription: { type: String, required: false },
    productMainImage: { type: String, required: false },
    productImages: { type: Array, required: false },
    productStock: { type: Number, required: false, default: 0 },
    productOffer: { type: Boolean, required: false, default: false },
    productDiscount: { type: Number, required: false, default: 0 },
    productCategory: { type: Schema.Types.ObjectId, required: false, ref: 'Categories' },
    // productLikes: { type: Number, required: false, default: 0 },
    productComment: { type: String, required: false },
    isPriceDisabled: {
        type: Boolean,
        default: false
    }
})

productsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Products', productsSchema, 'Products')