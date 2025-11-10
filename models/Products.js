const { default: mongoose, Schema } = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2')

const productsSchema = mongoose.Schema({
    productName: { type: String, required: false },
    productPrice: { type: Number, required: false },
    productTag: { type: Array, required: false },
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
    productComment: { type: String, required: false },
    isPriceDisabled: { type: Boolean, default: false },
    sku: { type: String, unique: true, sparse: true },
    barcode: { type: String },
    minStock: { type: Number, default: 0 },
    maxStock: { type: Number },
    lowStockAlert: { type: Boolean, default: false },
    costPrice: { type: Number },
    seoTitle: { type: String },
    seoDescription: { type: String },
    slug: { type: String, unique: true, sparse: true },
    metaKeywords: [String],
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'archived'],
        default: 'draft'
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    hasVariants: { type: Boolean, default: false },
    variants: [{
        sku: String,
        color: String,
        size: String,
        price: Number,
        stock: Number,
        image: String
    }],
    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})
productsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
productsSchema.index({ sku: 1 });
productsSchema.index({ slug: 1 });
productsSchema.index({ status: 1 });
productsSchema.index({ productCategory: 1 });
productsSchema.index({ createdAt: -1 });
productsSchema.virtual('profitMargin').get(function() {
    if (this.costPrice && this.productPrice) {
        return ((this.productPrice - this.costPrice) / this.costPrice * 100).toFixed(2);
    }
    return 0;
});
productsSchema.methods.checkLowStock = function() {
    return this.productStock <= this.minStock;
};
productsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Products', productsSchema, 'Products')
productsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Products', productsSchema, 'Products')