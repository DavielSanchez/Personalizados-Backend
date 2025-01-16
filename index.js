const express = require('express')
const dotenv = require('dotenv')
const { mongoConnection } = require('./DB')
const cors = require('cors')
    // const port = 3000

// External routes //
const Categories = require('./Endpoints/Categories')
const Products = require('./Endpoints/Products')
const Reviews = require('./Endpoints/Reviews')
const Users = require('./Endpoints/User')
const ShoppingCart = require('./Endpoints/ShoppingCart')
const NewsLetter = require('./Endpoints/NewsLetter')
    ////////////////////

// Server run //
const app = express()

////////////////


dotenv.config();
mongoConnection(process.env.MONGODB_URI);


// MIDDLEWARES //
app.use(cors({
    origin: ['http://localhost:3000', 'https://blanchedalmond-kingfisher-785257.hostingersite.com', 'http://localhost:3002', 'https://grey-heron-584852.hostingersite.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json())
app.use('/', Categories)
app.use('/', Products)
app.use('/', Reviews)
app.use('/', Users)
app.use('/', ShoppingCart)
app.use('/', NewsLetter)

////////////////

app.get('/', (req, res) => {
    res.json({
        response: 'success'
    })
})

app.listen(process.env.PORT, () => {
    console.log(`App corriendo en el puerto ${process.env.PORT}`);
})