require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');

const productRoutes = require('./src/routes/ProductRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Rutas
app.use('/api/productos', productRoutes);
app.use('/api/auth', authRoutes);

// Dashboard
app.get('/dashboard', async (req, res) => {
  try {
    const Product = require('./src/models/Product');
    const productos = await Product.find();
    res.render('index', { productos });
  } catch (error) {
    res.status(500).send('Error al cargar el panel');
  }
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado exitosamente a MongoDB'))
  .catch(err => console.error('❌ Error de conexión a la DB:', err));


// Revisión automática de inventario
// (cada 15 segundos)
cron.schedule('* * * * *', async () => {
  try {
    const Product = require('./src/models/Product');

    // Consulta: productos con stock bajo y alerta aún no enviada
    const productosBajos = await Product.find({
      $expr: { $lt: ['$cantidad', '$umbralMinimo'] },
      estadoAlerta: false
    });

    if (productosBajos.length > 0) {
      console.log(`\n📣 [ALERTA DE SISTEMA - ${new Date().toLocaleTimeString()}]`);
      for (const p of productosBajos) {
        console.log(`  ⚠️ [ALERTA SMS]: El producto "${p.nombre}" tiene stock bajo. Quedan ${p.cantidad} (Mínimo: ${p.umbralMinimo})`);
        await Product.findByIdAndUpdate(p._id, { estadoAlerta: true });
      }
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] ✔️ Inventario revisado. Sin alertas nuevas.`);
    }
  } catch (err) {
    console.error('Error en la tarea programada:', err);
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});