const { default: mongoose, Schema } = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2')

const reviewsSchema = mongoose.Schema({
    reviewRating: { type: Number, required: true },
    reviewContent: { type: String, required: true },
    productId: { type: String, required: true },
    reviewDate: { type: Date, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'Users' },

})

reviewsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Reviews', reviewsSchema, 'Reviews')


