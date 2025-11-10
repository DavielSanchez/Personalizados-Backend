const Product = require('../models/Products');

async function generateUniqueBarcode() {
    const generateBarcode = () => {
        const prefix = '75';
        const random = Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10);
        const barcode = prefix + random;

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(barcode[i]);
            sum += (i % 2 === 0) ? digit : digit * 3;
        }
        const checkDigit = (10 - (sum % 10)) % 10;

        return barcode + checkDigit;
    };

    let barcode;
    let attempts = 0;

    do {
        barcode = generateBarcode();
        const existingProduct = await Product.findOne({ barcode });
        if (!existingProduct) {
            break;
        }
        attempts++;
    } while (attempts < 10);

    return barcode;
}

module.exports = {
    generateUniqueBarcode
};