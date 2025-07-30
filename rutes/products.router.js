import { Router } from 'express';
import { productManager } from '../managers/ProductManager.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        // Emitir evento a todos los clientes conectados
        const io = req.app.get('io');
        io.emit('updateProducts', await productManager.getProducts());
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        const io = req.app.get('io');
        io.emit('updateProducts', await productManager.getProducts());
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    try {
        await productManager.deleteProduct(req.params.pid);
        // Emitir evento a todos los clientes conectados
        const io = req.app.get('io');
        io.emit('updateProducts', await productManager.getProducts());
        res.status(200).json({ message: `Producto con id ${req.params.pid} eliminado.` });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;