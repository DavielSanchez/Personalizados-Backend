const { default: mongoose } = require("mongoose")

const categoriesSchema = mongoose.Schema({
    categoryName: { type: String, required: true },
    categoryImage: { type: String, required: true },
    categoryTag: { type: String, required: true },
    categoryComment: { type: String, required: false }
})

module.exports = mongoose.model('Categories', categoriesSchema, 'Categories')