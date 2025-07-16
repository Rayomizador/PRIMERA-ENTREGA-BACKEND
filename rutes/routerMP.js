    // routes/main.routes.js
import { Router } from 'express';
import { mostrarPaginaPrincipal } from '../managers/Mainpage.js';

const router = Router();

// La ruta principal '/' ahora está conectada a nuestra lógica
// que lee el archivo JSON.
router.get('/', mostrarPaginaPrincipal);

export default router;