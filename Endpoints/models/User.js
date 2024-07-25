const { default: mongoose, Schema } = require("mongoose")
const bcrypt = require('bcrypt')
const saltRounds = 10;

const userSchema = mongoose.Schema({
    userFirstName: { type: String, required: true },
    userLastName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    userAddress: { street: String, city: String, state: String, postalCode: String, country: String },
    phoneNumber: String,
    userRegistrationDate: { type: Date, default: Date.now },
    lastLogin: Date,
    userRole: { type: String, enum: ['cliente', 'administrador'], default: 'cliente' },
    userAccountStatus: { type: String, enum: ['activo', 'suspendido', 'pendiente'], default: 'pendiente' },

});

userSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('userPassword')) {
        const document = this;
        bcrypt.hash(document.userPassword, saltRounds, (error, hashedPassword) => {
            if (error) {
                next(error);
            } else {
                document.userPassword = hashedPassword;
                next()
            }
        })
    }
})

userSchema.methods.isCorrectPassword = function(userPassword, callback) {
    bcrypt.compare(userPassword, this.userPassword, function(error, same) {
        if (error) {
            callback(error)
        } else {
            callback(error, same)
        }
    })
}


module.exports = mongoose.model('Users', userSchema, 'Users')