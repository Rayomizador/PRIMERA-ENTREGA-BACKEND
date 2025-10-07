import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './rutes/products.router.js';
import cartsRouter from './rutes/carts.router.js';
import viewsRouter from './rutes/views.router.js';

// --- Configuración Inicial ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//USO DE BOOTSTRAP
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// --- Configuración de Handlebars (Motor de Plantillas) ---
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// --- Configuración de Socket.io ---
const httpServer = createServer(app);
const io = new Server(httpServer);

// Hacemos 'io' accesible globalmente para las rutas
app.set('io', io);

// --- Rutas ---
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// --- Inicialización del Servidor ---
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

// --- Lógica de Sockets ---
io.on('connection', (socket) => {
    console.log(`✅ Nuevo cliente conectado: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});
