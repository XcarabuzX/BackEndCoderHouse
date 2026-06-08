import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import viewsRouter from './src/routes/views.router.js';
import sessionsRouter from './src/routes/sessions.router.js';
import { productService } from './src/services/product.service.js';
import { connectDB } from './src/config/mongoose.config.js';
import { initializePassport } from './src/config/passport.config.js';
import { config } from './src/config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = config.port;

// Motor de plantillas Handlebars
app.engine('handlebars', engine({
  helpers: {
    multiply: (a, b) => (a * b).toFixed(2)
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Passport
initializePassport();
app.use(passport.initialize());

// Compartir io con los routers HTTP
app.locals.io = io;

// Rutas de vistas (HTML)
app.use('/', viewsRouter);

// Rutas de la API REST
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);

// Manejo de errores global. Respeta el statusCode de los AppError de negocio.
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status === 500) console.error(err.stack);
  res.status(status).json({ status: 'error', message: err.message || 'Error interno del servidor' });
});

// Lógica WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('newProduct', async (data) => {
    try {
      await productService.createProduct(data);
      const result = await productService.getProducts();
      io.emit('updateProducts', result.payload);
    } catch (error) {
      socket.emit('productError', { message: error.message });
    }
  });

  socket.on('deleteProduct', async (id) => {
    try {
      await productService.deleteProduct(id);
      const result = await productService.getProducts();
      io.emit('updateProducts', result.payload);
    } catch (error) {
      socket.emit('productError', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

await connectDB();

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
