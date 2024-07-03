const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB', err));

// Configuración de Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar JSON
app.use(express.json());

// Routers
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: [] });
});

// Vista home de productos
app.get('/home', (req, res) => {
    res.render('home', { products: [] });
});

// Middleware para pasar la instancia de Socket.io a los routers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Ruta para la vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: [] });
});

// Ruta para la vista home de productos
app.get('/home', (req, res) => {
    res.render('home', { products: [] });
});

// Configuración de WebSocket
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Manejar desconexión de usuarios
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

// Escuchar conexiones de WebSocket
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Escuchar evento de creación de producto
    socket.on('productoCreado', (producto) => {
        io.emit('productoActualizado', producto);
    });

    // Escuchar evento de eliminación de producto
    socket.on('productoEliminado', (productoId) => {
        io.emit('productoEliminado', productoId);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
