
// 1. Importamos los módulos necesarios
import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js'; // ¡IMPORTANTE! Asumo que tu ProductManager está en una carpeta 'models'. Ajusta la ruta si es necesario.
import path from 'path';
import { fileURLToPath } from 'url';

// 2. Boilerplate para obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Creamos una instancia del router y del ProductManager
const router = Router();

// Construimos la ruta al archivo JSON una sola vez
const productsFilePath = path.join(__dirname, '../DATA/products.json');
const productManager = new ProductManager(productsFilePath);


// 4. Definimos la ruta principal
router.get('/', async (req, res) => {
    try {
        // Usamos nuestro ProductManager ya corregido para obtener los productos
        const productos = await productManager.getProducts();

        // Renderizamos la vista 'home' con los datos
        res.render('home', {
            titulo: "Tienda - Productos",
            listaDeProductos: productos,
            hayProductos: productos.length > 0,
            cssFile: 'style.css'
        });

    } catch (error) {
        // Si algo falla, el catch nos protegerá
        console.error("Error al obtener productos para la página principal:", error);
        res.status(500).render('error', { 
            mensajeDeError: "No se pudieron cargar los productos en este momento."
        });
    }
});

// Este archivo ya no exporta una función, sino el router configurado.
// Así que tu server.js debe usarlo así: app.use('/', mainPageRouter);
export default router;