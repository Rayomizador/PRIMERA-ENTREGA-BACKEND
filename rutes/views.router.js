// src/routes/views.router.js

import { Router } from 'express';
import { productManager } from '../managers/ProductManager.js';


const router = Router();

// rutes/views.router.js
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Bienvenido a Nuestra Tienda'
    });
});

router.get('/products', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Renderiza la misma vista 'home.handlebars' que ya teníamos
        res.render('home', { 
            title: 'Nuestros Productos',
            products: products 
        });
    } catch (error) {
        res.status(500).render('error', { message: 'No se pudieron cargar los productos.' });
    }
});


// --- NUEVA RUTA PARA VER EL DETALLE DE UN PRODUCTO ---
router.get('/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);
        
        // Renderiza una nueva vista llamada 'productDetail' y le pasa los datos del producto
        res.render('productDetail', { 
            title: product.title, // El título de la página será el nombre del producto
            product: product 
        });
    } catch (error) {
        console.error(error);
        res.status(404).render('error', { message: 'Producto no encontrado.' });
    }
});


// --- RUTA EXISTENTE PARA PRODUCTOS EN TIEMPO REAL ---
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realtimeproducts', {
            title: 'Gestión en Tiempo Real',
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'No se pudieron cargar los productos en tiempo real.' });
    }
});

// Vistas de autenticación
router.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar Sesión' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Registrarse' });
});

export default router;