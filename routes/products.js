const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar datos de productos desde un JSON
const productsFilePath = path.join(__dirname, '../data/products.json');
let productos = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

// guarda datos de los productos en el JSON
const saveProducts = () => {
    fs.writeFileSync(productsFilePath, JSON.stringify(productos, null, 2), 'utf-8');
};

// Lista todos los productos 
router.get('/', (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : productos.length; // Obtener el límite de la consulta
    res.json(productos.slice(0, limit)); // Devolver los productos hasta el límite especificado
});

//Obtiene un producto por ID
router.get('/:pid', (req, res) => {
    const productId = req.params.pid; 
    const producto = productos.find(p => p.id === productId); 

    if (producto) {
        res.json(producto); 
    } else {
        res.status(404).json({ error: 'Producto no encontrado' }); 
    }
});

// Agregar un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body; // Obtener los datos del producto del cuerpo de la solicitud

    // Verificar que todos los campos obligatorios estén presentes
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos excepto thumbnails son obligatorios' });
    }

    // Generar un nuevo producto único
    const nuevoProducto = {
        id: (productos.length > 0) ? (parseInt(productos[productos.length - 1].id) + 1).toString() : "1",
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    productos.push(nuevoProducto);
    saveProducts(); 
    res.status(201).json(nuevoProducto); 
});

// Actualiza un producto por ID
router.put('/:pid', (req, res) => {
    const productId = req.params.pid; 
    const { title, description, code, price, status, stock, category, thumbnails } = req.body; 
    const indiceProducto = productos.findIndex(p => p.id === productId); 
    if (indiceProducto === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' }); 
    }

    // Actualiza los campos del producto si están en la solicitud
    const productoActualizado = {
        ...productos[indiceProducto],
        title: title !== undefined ? title : productos[indiceProducto].title,
        description: description !== undefined ? description : productos[indiceProducto].description,
        code: code !== undefined ? code : productos[indiceProducto].code,
        price: price !== undefined ? price : productos[indiceProducto].price,
        status: status !== undefined ? status : productos[indiceProducto].status,
        stock: stock !== undefined ? stock : productos[indiceProducto].stock,
        category: category !== undefined ? category : productos[indiceProducto].category,
        thumbnails: thumbnails !== undefined ? thumbnails : productos[indiceProducto].thumbnails,
    };

    productos[indiceProducto] = productoActualizado; 
    saveProducts(); 
    res.json(productoActualizado);
});

// Elimina producto por ID
router.delete('/:pid', (req, res) => {
    const productId = req.params.pid; 
    const indiceProducto = productos.findIndex(p => p.id === productId); 
    
    if (indiceProducto === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    productos.splice(indiceProducto, 1); 
    saveProducts(); 
    res.status(204).end(); 
});

module.exports = router; 