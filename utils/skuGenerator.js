const Product = require('../models/Products');

async function generateProductSKU(productName) {
    let baseSku = 'PROD';

    if (productName) {
        const words = productName.split(' ').filter(word => word.length > 0);

        if (words.length === 1) {
            baseSku = words[0].substring(0, 6).toUpperCase();
        } else {
            const initials = words.map(word => word.substring(0, 3).toUpperCase()).join('');
            baseSku = initials.substring(0, 6);
        }

        baseSku = baseSku.replace(/[^A-Z]/g, '');

        if (baseSku.length === 0) {
            baseSku = 'PROD';
        }
    }

    const existingProducts = await Product.find({
        sku: new RegExp(`^SKU-${baseSku}`, 'i')
    }).sort({ sku: -1 });

    let sequence = 1;
    if (existingProducts.length > 0) {
        const lastSku = existingProducts[0].sku;
        const lastSequence = parseInt(lastSku.replace(`SKU-${baseSku}`, '')) || 0;
        sequence = lastSequence + 1;
    }

    return `SKU-${baseSku}${sequence.toString().padStart(3, '0')}`;
}

async function generateVariantSKU(productName, color, size, variantIndex) {
    let baseSku = 'PROD';

    if (productName) {
        const words = productName.split(' ').filter(word => word.length > 0);

        if (words.length === 1) {
            baseSku = words[0].substring(0, 4).toUpperCase();
        } else {
            const initials = words.map(word => word.substring(0, 2).toUpperCase()).join('');
            baseSku = initials.substring(0, 4);
        }

        baseSku = baseSku.replace(/[^A-Z]/g, '');

        if (baseSku.length === 0) {
            baseSku = 'PROD';
        }
    }

    let colorCode = 'DEF';
    if (color) {
        colorCode = color.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
        if (colorCode.length === 0) colorCode = 'DEF';
    }

    let sizeCode = 'ST';
    if (size) {
        sizeCode = size.substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (sizeCode.length === 0) sizeCode = 'ST';
    }

    const existingVariants = await Product.find({
        'variants.sku': new RegExp(`^SKU-${baseSku}-${colorCode}-${sizeCode}`, 'i')
    });

    let sequence = 1;
    if (existingVariants.length > 0) {
        const allVariantSKUs = existingVariants.flatMap(p =>
            p.variants.map(v => v.sku)
        ).filter(sku => sku && sku.startsWith(`SKU-${baseSku}-${colorCode}-${sizeCode}`));

        if (allVariantSKUs.length > 0) {
            const lastSKU = allVariantSKUs[allVariantSKUs.length - 1];
            const lastSequence = parseInt(lastSKU.split('-').pop()) || 0;
            sequence = lastSequence + 1;
        }
    }

    return `SKU-${baseSku}-${colorCode}-${sizeCode}-${sequence.toString().padStart(2, '0')}`;
}

module.exports = {
    generateProductSKU,
    generateVariantSKU
};