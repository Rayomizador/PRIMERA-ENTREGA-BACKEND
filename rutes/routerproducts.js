// routes/products.js
import { Router } from 'express'; // Importa Router de Express
import ProductManager from '../managers/ProductManager.js'; // Importa la clase ProductManager
import path from 'path'; // Importa el módulo 'path' para manejar rutas de archivos
import { fileURLToPath } from 'url'; // Importa fileURLToPath para obtener la ruta del archivo

// Obtiene la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define la ruta al archivo products.json
const productsFilePath = path.join(__dirname, '../data/products.json');
const productManager = new ProductManager(productsFilePath); // Crea una instancia de ProductManager

const router = Router(); // Crea un nuevo router de Express

// Middleware para asegurar que el ProductManager esté inicializado antes de cada solicitud
router.use(async (req, res, next) => {
    // Espera a que la inicialización del ProductManager se complete
    await productManager.initialize();
    next(); // Continúa con la siguiente función middleware o ruta
});

// GET /api/products/
// Obtiene todos los productos (con opción de límite)
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts(); // Obtiene todos los productos
        const limit = parseInt(req.query.limit); // Obtiene el parámetro de consulta 'limit'

        if (!isNaN(limit) && limit > 0) {
            // Si se especifica un límite válido, retorna solo esa cantidad de productos
            return res.json(products.slice(0, limit));
        }
        res.json(products); // Retorna todos los productos si no hay límite
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener productos.' });
    }
});

// GET /api/products/:pid
// Obtiene un producto por su ID
router.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid); // Obtiene el ID del producto de los parámetros de la URL
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido.' });
        }
        const product = await productManager.getProductById(productId); // Busca el producto por ID
        res.json(product); // Retorna el producto encontrado
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message }); // 404 si no se encuentra el producto
        }
        res.status(500).json({ error: 'Error interno del servidor al obtener producto.' });
    }
});

// POST /api/products/
// Agrega un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProductData = req.body; // Obtiene los datos del nuevo producto del cuerpo de la solicitud
        const newProduct = await productManager.addProduct(newProductData); // Agrega el producto
        res.status(201).json(newProduct); // Retorna el producto creado con estado 201
    } catch (error) {
        console.error('Error al agregar producto:', error);
        if (error.message.includes('requeridos') || error.message.includes('ya existe')) {
            return res.status(400).json({ error: error.message }); // 400 si hay errores de validación
        }
        res.status(500).json({ error: 'Error interno del servidor al agregar producto.' });
    }
});

// PUT /api/products/:pid
// Actualiza un producto por su ID
router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid); // Obtiene el ID del producto
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido.' });
        }
        const updatedFields = req.body; // Obtiene los campos a actualizar del cuerpo de la solicitud
        const updatedProduct = await productManager.updateProduct(productId, updatedFields); // Actualiza el producto
        res.json(updatedProduct); // Retorna el producto actualizado
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message }); // 404 si no se encuentra el producto
        }
        res.status(500).json({ error: 'Error interno del servidor al actualizar producto.' });
    }
});

// DELETE /api/products/:pid
// Elimina un producto por su ID
router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid); // Obtiene el ID del producto
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'ID de producto inválido.' });
        }
        const result = await productManager.deleteProduct(productId); // Elimina el producto
        res.json(result); // Retorna el mensaje de éxito
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message }); // 404 si no se encuentra el producto
        }
        res.status(500).json({ error: 'Error interno del servidor al eliminar producto.' });
    }
});

export default router; // Exporta el router de productos
