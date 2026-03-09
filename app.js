import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import path from 'path';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import viewsRouter from './src/routes/views.router.js';
import { ProductManager } from './src/managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const productManager = new ProductManager();
const PORT = 8080;

// Motor de plantillas Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Compartir io con los routers HTTP
app.locals.io = io;

// Rutas de vistas (HTML)
app.use('/', viewsRouter);

// Rutas de la API REST
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

// Lógica WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('newProduct', async (data) => {
    try {
      await productManager.addProduct(data);
      const products = await productManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      socket.emit('productError', { message: error.message });
    }
  });

  socket.on('deleteProduct', async (id) => {
    try {
      await productManager.deleteProduct(Number(id));
      const products = await productManager.getProducts();
      io.emit('updateProducts', products);
    } catch (error) {
      socket.emit('productError', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
