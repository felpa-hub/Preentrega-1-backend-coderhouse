const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar datos de los carritos
const cartsFilePath = path.join(__dirname, '../data/carts.json');
let carritos = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));

// Función para guardar datos de los carritos
const saveCarts = () => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carritos, null, 2), 'utf-8');
};

// GET /api/carts - Listar todos los carritos
router.get('/', (req, res) => {
    res.json(carritos);
});

// GET /api/carts/:cid - Obtener un carrito por ID
router.get('/:cid', (req, res) => {
    const carritoId = req.params.cid;
    const carrito = carritos.find(c => c.id === carritoId);

    if (carrito) {
        res.json(carrito.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// POST /api/carts - Crear un nuevo carrito
router.post('/', (req, res) => {
    const { products = [] } = req.body;

    const nuevoCarrito = {
        id: (carritos.length > 0) ? (parseInt(carritos[carritos.length - 1].id) + 1).toString() : "1",
        products
    };

    carritos.push(nuevoCarrito);
    saveCarts();
    res.status(201).json(nuevoCarrito);
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const carritoId = req.params.cid;
    const productoId = req.params.pid;

    const carrito = carritos.find(c => c.id === carritoId);
    if (!carrito) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const indiceProducto = carrito.products.findIndex(p => p.id === productoId);
    if (indiceProducto !== -1) {
        carrito.products[indiceProducto].quantity += 1;
    } else {
        carrito.products.push({ id: productoId, quantity: 1 });
    }

    saveCarts();
    res.status(201).json(carrito);
});

module.exports = router;
