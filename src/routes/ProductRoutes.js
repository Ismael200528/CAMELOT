const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middlewares/auth');

// 1-READ
router.get('/', async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// 2-CREATE
router.post('/', authMiddleware, async (req, res) => {
    try {
        const nuevoProducto = new Product(req.body);
        await nuevoProducto.save();
        res.status(201).json({ mensaje: "Producto registrado", producto: nuevoProducto });
    } catch (error) {
        res.status(400).json({ error: "Error al registrar producto" });
    }
});

// 3-PATCH
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const producto = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Alertas
        producto.estadoAlerta = producto.cantidad < producto.umbralMinimo;
        await producto.save();
        
        res.json(producto);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar" });
    }
});

module.exports = router;