

import express from 'express'; // ImportaExpress
import { engine } from 'express-handlebars';
import productsRouter from './rutes/routerproducts.js'; // Importa el router de productos
import cartsRouter from './rutes/routercart.js'; // Importa el router de carritos
import routerMP from './rutes/routerMP.js'; // Importa el router de Main page
import path from 'path'; // Importa el módulo 'path'
import { fileURLToPath } from 'url'; // Importa fileURLToPath para obtener la ruta del archivo


// Obtiene la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // Crea una instancia de la aplicación Express
const PORT = 8080; // Define el puerto en el que el servidor escuchará

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());
// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
//Middleware para usar handlebars
app.engine('hbs', engine({
    extname: '.hbs', // Usaremos la extensión .hbs para los archivos de plantilla
    defaultLayout: 'main', // Especificamos el layout por defecto
    layoutsDir: path.join(__dirname, 'views/layouts'), // Ruta a la carpeta de layouts
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')); // Ruta a la carpeta de vistas

// Usa los routers para las rutas de API

// Todas las rutas que comienzan con /api/products serán manejadas por productsRouter
app.use('/api/products', productsRouter);
// Todas las rutas que comienzan con /api/carts serán manejadas por cartsRouter
app.use('/api/carts', cartsRouter);
// para mostrar los productos en la pagina principal
app.use('/', routerMP);
// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi servidor Express!');
});


// Inicia el servidor y lo pone a escuchar en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log('Rutas de productos disponibles en /api/products');
    console.log('Rutas de carritos disponibles en /api/carts');
});
