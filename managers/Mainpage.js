// 1. Importamos los módulos necesarios
import { readFile } from 'fs/promises'; // La función para leer archivos que devuelve una promesa
import path from 'path';
import { fileURLToPath } from 'url';

// 2. Boilerplate para obtener la ruta del directorio actual en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Función para obtener los productos desde el archivo

const obtenerProductosDesdeArchivo = async () => {
    // Construimos la ruta absoluta al archivo JSON para evitar errores
    const filePath = path.join(__dirname, '../DATA/products.json');
    console.log(`Intentando leer el archivo desde: ${filePath}`);

    // Usamos await para esperar a que el archivo se lea.
    // readFile devuelve el contenido del archivo como un string.
    const fileContent = await readFile(filePath, 'utf-8');

    // Convertimos el string del archivo (que está en formato JSON) a un objeto JavaScript.
    const productos = JSON.parse(fileContent);
    return productos;
};

// 4. Función principal que se exporta y se usa en la ruta
export const mostrarPaginaPrincipal = async (req, res) => {
    try {
        // Llamamos a nuestra función para obtener los datos
        const productos = await obtenerProductosDesdeArchivo();

        // Renderizamos la vista 'home' con los datos leídos del archivo
        res.render('home', {
            titulo: "Tienda - Productos desde Archivo",
            listaDeProductos: productos,
            hayProductos: productos.length > 0,
            cssFile: 'style.css'
        });

    } catch (error) {
        // Si algo falla (ej: el archivo no existe, no es un JSON válido),
        // capturamos el error y enviamos una respuesta clara.
        console.error("Error al procesar la solicitud:", error);
        res.status(500).render('error', { // Suponiendo que tienes una vista error.hbs
            mensajeDeError: "No se pudieron cargar los productos. Inténtalo de nuevo más tarde."
        });
    }
};
