const { default: mongoose } = require("mongoose")

const NewsLetterSchema = mongoose.Schema({
    Name: { type: String, required: true },
    Email: { type: String, required: true },
    createdAt: { type: Date, required: true },
})

module.exports = mongoose.model('NewsLetter', NewsLetterSchema, 'NewsLetter')