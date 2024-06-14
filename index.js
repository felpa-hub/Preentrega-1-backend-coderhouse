const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 8080;

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
