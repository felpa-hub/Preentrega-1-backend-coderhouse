const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar datos de productos
const productsFilePath = path.join(__dirname, '../data/products.json');
let productos = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

// Función para guardar datos de productos
const saveProducts = () => {
    fs.writeFileSync(productsFilePath, JSON.stringify(productos, null, 2), 'utf-8');
};

// GET /api/products - Listar todos los productos
router.get('/', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : productos.length;
    res.json(productos.slice(0, limit));
});

// GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const productoId = req.params.pid;
    const producto = productos.find(p => p.id === productoId);

    if (producto) {
        res.json(producto);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// POST /api/products - Crear un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;

    const nuevoProducto = {
        id: (productos.length > 0) ? (parseInt(productos[productos.length - 1].id) + 1).toString() : "1",
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
    };

    productos.push(nuevoProducto);
    saveProducts();

    // Emitir evento de creación de producto a través de WebSocket
    req.app.get('io').emit('productoCreado', nuevoProducto);

    res.status(201).json(nuevoProducto);
});

// PUT /api/products/:pid - Actualizar un producto
router.put('/:pid', (req, res) => {
    const productoId = req.params.pid;
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    const producto = productos.find(p => p.id === productoId);
    if (producto) {
        producto.title = title || producto.title;
        producto.description = description || producto.description;
        producto.code = code || producto.code;
        producto.price = price || producto.price;
        producto.stock = stock || producto.stock;
        producto.category = category || producto.category;
        producto.thumbnails = thumbnails || producto.thumbnails;

        saveProducts();
        res.json(producto);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// DELETE /api/products/:pid - Eliminar un producto
router.delete('/:pid', (req, res) => {
    const productoId = req.params.pid;
    const index = productos.findIndex(p => p.id === productoId);

    if (index !== -1) {
        productos.splice(index, 1);
        saveProducts();

        // Emitir evento de eliminación de producto a través de WebSocket
        req.app.get('io').emit('productoEliminado', productoId);

        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

module.exports = router;
