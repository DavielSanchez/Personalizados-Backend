const Product = require('../models/Products');

async function generateUniqueSlug(productName) {
    let baseSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existingProduct = await Product.findOne({ slug });
        if (!existingProduct) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

module.exports = {
    generateUniqueSlug
};