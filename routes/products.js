const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET /api/products - Listar todos los productos
router.get('/', async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort ? { price: req.query.sort === 'asc' ? 1 : -1 } : {};

    try {
        const products = await Product.find().sort(sort).limit(limit).skip((page - 1) * limit);
        const totalProducts = await Product.countDocuments();

        res.json({
            status: 'success',
            payload: products,
            totalPages: Math.ceil(totalProducts / limit),
            prevPage: page > 1 ? page - 1 : null,
            nextPage: (page * limit) < totalProducts ? page + 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: (page * limit) < totalProducts,
            prevLink: page > 1 ? `/api/products?page=${page - 1}&limit=${limit}` : null,
            nextLink: (page * limit) < totalProducts ? `/api/products?page=${page + 1}&limit=${limit}` : null
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// GET /api/products/:pid - Obtene producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// POST /api/products - Crear nuevo producto
router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;

    const nuevoProducto = new Product({
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails
    });

    try {
        const savedProduct = await nuevoProducto.save();

        req.io.emit('productoCreado', savedProduct);

        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// PUT /api/products/:pid - Actualizar producto
router.put('/:pid', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, {
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails
        }, { new: true });

        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// DELETE /api/products/:pid - Eliminar producto
router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
        if (deletedProduct) {
            // Emitir evento de eliminación de producto a través de WebSocket
            req.io.emit('productoEliminado', req.params.pid);
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports = router;
