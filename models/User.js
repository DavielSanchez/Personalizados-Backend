const { default: mongoose, Schema } = require("mongoose");
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const userSchema = mongoose.Schema({
    userFirstName: { type: String, required: false },
    userLastName: { type: String, required: false },
    userName: { type: String, required: false, unique: true },
    userEmail: { type: String, required: false, unique: true },
    userPassword: { type: String, required: false },
    phoneNumber: { type: Number, required: false },
    userRegistrationDate: { type: Date, default: Date.now },
    lastLogin: { type: Date, required: false },
    userRole: { type: String, enum: ['cliente', 'administrador'], default: 'cliente' },
    userAccountStatus: { type: String, enum: ['activo', 'suspendido', 'pendiente'], default: 'activo' },
    profileImageUrl: { type: String, required: false },
    firebaseUID: { type: String, required: false }
});

// Middleware para hash de contraseña
userSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('userPassword')) {
        const document = this;

        // Verificar si la contraseña existe antes de hacer el hash
        if (!document.userPassword) {
            return next(new Error('userPassword is required'));
        }

        bcrypt.hash(document.userPassword, saltRounds, (error, hashedPassword) => {
            if (error) {
                next(error);
            } else {
                document.userPassword = hashedPassword;
                next();
            }
        });
    } else {
        next();
    }
});

// Método para comparar contraseñas
userSchema.methods.isCorrectPassword = function(userPassword, callback) {
    bcrypt.compare(userPassword, this.userPassword, function(error, same) {
        if (error) {
            callback(error);
        } else {
            callback(null, same);
        }
    });
};

module.exports = mongoose.model('Users', userSchema, 'Users');
