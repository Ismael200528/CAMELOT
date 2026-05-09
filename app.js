require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./src/routes/ProductRoutes'); 

const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './src/views');

app.get('/dashboard', async (req, res) => {
    try {
        const Product = require('./src/models/Product'); 
        const productos = await Product.find(); 
        res.render('index', { productos }); 
    } catch (error) {
        res.status(500).send("Error al cargar el panel");
    }
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado exitosamente a MongoDB'))
    .catch(err => console.error('❌ Error de conexión a la DB:', err));

// Rutas
app.use('/api/productos', productRoutes);

const cron = require('node-cron');

cron.schedule('* * * * *', async () => {
    try {
        const Product = require('./src/models/Product');
        const productosBajos = await Product.find({
            $expr: { $lt: ["$cantidad", "$umbralMinimo"] }
        });

        if (productosBajos.length > 0) {
            console.log(`\n📢 [ALERTA DE SISTEMA - ${new Date().toLocaleTimeString()}]`);
            productosBajos.forEach(p => {
                console.log(`⚠️ Stock Bajo en "${p.nombre}": Quedan ${p.cantidad} (Mínimo: ${p.umbralMinimo})`);
            });
        }
    } catch (err) {
        console.error("Error en la tarea programada:", err);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor StockAlert corriendo en http://localhost:${PORT}`);
});