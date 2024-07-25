const express = require('express')
const dotenv = require('dotenv')
const { mongoConnection } = require('./DB')
const cors = require('cors')
const port = 3000

// External routes //
const Categories = require('./Endpoints/Categories')
const Products = require('./Endpoints/Products')
const Reviews = require('./Endpoints/Reviews')

////////////////////

// Server run //
const app = express()

////////////////


dotenv.config();
mongoConnection(process.env.MONGODB_URI);


// MIDDLEWARES //
app.use(cors())
app.use(express.json())
app.use('/', Categories)
app.use('/', Products)
app.use('/', Reviews)

////////////////

app.get('/', (req, res) => {
    res.json({
        response: 'success'
    })
})

app.listen(process.env.PORT, () => {
    console.log(`App corriendo en el puerto ${process.env.PORT}`);
})