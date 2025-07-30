// src/routes/views.router.js

import { Router } from 'express';
import { productManager } from '../managers/ProductManager.js';

const router = Router();

// --- RUTA NUEVA PARA LA VISTA HOME ---
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Renderiza la nueva vista 'home.handlebars'
        res.render('home', { 
            title: 'Inicio - Todos los Productos',
            products: products 
        });
    } catch (error) {
        res.status(500).render('error', { message: 'No se pudieron cargar los productos.' });
    }
});


// --- RUTA EXISTENTE PARA PRODUCTOS EN TIEMPO REAL ---
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { 
            title: 'Productos en Tiempo Real',
            products: products 
        });
    } catch (error) {
        res.status(500).render('error', { message: 'No se pudieron cargar los productos.' });
    }
});

export default router;