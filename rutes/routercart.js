// routes/carts.js
import { Router } from 'express'; // Importa Router de Express
import CartManager from '../managers/CartManager.js'; // Importa la clase CartManager
import path from 'path'; // Importa el módulo 'path'
import { fileURLToPath } from 'url'; // Importa fileURLToPath

// Obtiene la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define la ruta al archivo carts.json
const cartsFilePath = path.join(__dirname, '../data/carts.json');
const cartManager = new CartManager(cartsFilePath); // Crea una instancia de CartManager

const router = Router(); // Crea un nuevo router de Express

// Middleware para asegurar que el CartManager esté inicializado antes de cada solicitud
router.use(async (req, res, next) => {
    // Espera a que la inicialización del CartManager se complete
    await cartManager.initialize();
    next(); // Continúa con la siguiente función middleware o ruta
});

// POST /api/carts/
// Crea un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart(); // Crea un nuevo carrito
        res.status(201).json(newCart); // Retorna el carrito creado con estado 201
    } catch (error) {
        console.error('Error al crear carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear carrito.' });
    }
});

// GET /api/carts/:cid
// Lista los productos de un carrito específico
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid; // Obtiene el ID del carrito
        const cart = await cartManager.getCartById(cartId); // Busca el carrito por ID
        res.json(cart.products); // Retorna solo los productos del carrito
    } catch (error) {
        console.error('Error al obtener productos del carrito:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message }); // 404 si no se encuentra el carrito
        }
        res.status(500).json({ error: 'Error interno del servidor al obtener productos del carrito.' });
    }
});

// POST /api/carts/:cid/product/:pid
// Agrega un producto a un carrito específico
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid; // Obtiene el ID del carrito
        const productId = parseInt(req.params.pid); // Obtiene el ID del producto
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido.' });
        }
        const updatedCart = await cartManager.addProductToCart(cartId, productId); // Agrega el producto al carrito
        res.json(updatedCart); // Retorna el carrito actualizado
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message }); // 404 si no se encuentra el carrito
        }
        res.status(500).json({ error: 'Error interno del servidor al agregar producto al carrito.' });
    }
});

export default router; // Exporta el router de carritos
