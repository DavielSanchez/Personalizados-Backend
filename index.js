const express = require('express')
const dotenv = require('dotenv')
const { mongoConnection } = require('./DB')
const cors = require('cors')
    // const port = 3000

// External routes //
// const Categories = require('./Endpoints/Categories')
const ProductsAdmin = require('./routes/admin/products')
const ProductsStore = require('./routes/store/products')
    // const Reviews = require('./Endpoints/Reviews')
    // const Users = require('./Endpoints/User')
    // const ShoppingCart = require('./Endpoints/ShoppingCart')
    // const NewsLetter = require('./Endpoints/NewsLetter')
    ////////////////////

// Server run //
const app = express()

////////////////


dotenv.config();
mongoConnection(process.env.MONGODB_URI);


// MIDDLEWARES //
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'https://blanchedalmond-kingfisher-785257.hostingersite.com',
        'https://grey-heron-584852.hostingersite.com',
        'https://personalizadoscms.davielsanchez.com',
        'https://personalizadosrd.davielsanchez.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
// app.use('/', Categories);
app.use('/admin/products/', ProductsAdmin);
app.use('/store/', ProductsStore);
// app.use('/', Reviews);
// app.use('/', Users);
// app.use('/', ShoppingCart);
// app.use('/', NewsLetter);

////////////////

app.get('/', (req, res) => {
    res.json({
        response: 'success'
    })
})

app.listen(process.env.PORT, () => {
    console.log(`App corriendo en el puerto ${process.env.PORT}`);
})