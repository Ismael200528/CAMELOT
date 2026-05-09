const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    umbralMinimo: { type: Number, required: true }, 
    estadoAlerta: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Product', productSchema);