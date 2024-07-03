const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');

// GET /api/carts - Listar carritos
router.get('/', async (req, res) => {
    try {
        const carts = await Cart.find().populate('products.product');
        res.json(carts);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los carritos' });
    }
});

// GET /api/carts/:cid - Obtener carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (cart) {
            res.json(cart.products);
        } else {
            res.status(404).json({ error: 'Carrito no
