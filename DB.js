const { default: mongoose, connect } = require('mongoose')

// Mongo DB and mongoose connection and validation //
const mongoConnection = (stringConnection) => {
        mongoose.connect(stringConnection);

        const connection = mongoose.connection;

        connection.once('open', () => {
            console.log('Conexion a la base de datos exitosa')
        })

        connection.on('error', (err) => {
            console.log('Conexion a la base de datos Fallida', err)
        })
    }
    ////////////////////////////////////////////////////

module.exports = { mongoConnection }

process.env.MONGODB_URI