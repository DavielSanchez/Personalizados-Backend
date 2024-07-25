const { default: mongoose } = require("mongoose")

const categoriesSchema = mongoose.Schema({
    categoryName: { type: String, required: true },
    categoryImage: { type: String, required: true },
    categoryTag: { type: String, required: true }
})

module.exports = mongoose.model('Categories', categoriesSchema, 'Categories')