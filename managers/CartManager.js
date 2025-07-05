import fs from 'fs/promises'; // Importa el módulo 'fs/promises'
import { v4 as uuidv4 } from 'uuid'; // Importa uuid para generar IDs únicos

class CartManager {
    constructor(filePath) {
        this.filePath = filePath; // Ruta del archivo JSON de carritos
        this.carts = []; // Array para almacenar los carritos en memoria
        this.initialize(); // Llama al método de inicialización
    }

    // Método asíncrono para inicializar el CartManager
    async initialize() {
        try {
            // Intenta leer el archivo de carritos
            const data = await fs.readFile(this.filePath, 'utf8');
            this.carts = JSON.parse(data); // Parsea los datos JSON
            console.log('Carritos cargados desde el archivo:', this.filePath);
        } catch (error) {
            // Si el archivo no existe o hay un error, inicializa un array vacío
            if (error.code === 'ENOENT') {
                console.log('El archivo de carritos no existe, creando uno nuevo:', this.filePath);
                await this.saveCarts(); // Guarda un array vacío para crear el archivo
            } else {
                console.error('Error al inicializar CartManager:', error);
            }
        }
    }

    // Método privado asíncrono para guardar los carritos en el archivo JSON
    async saveCarts() {
        try {
            // Escribe el array de carritos en el archivo, formateado para legibilidad
            await fs.writeFile(this.filePath, JSON.stringify(this.carts, null, 2), 'utf8');
            console.log('Carritos guardados en el archivo:', this.filePath);
        } catch (error) {
            console.error('Error al guardar carritos:', error);
            throw new Error('No se pudieron guardar los carritos.');
        }
    }

    // Método para crear un nuevo carrito
    async createCart() {
        const newCart = {
            id: uuidv4(), // Genera un ID único para el carrito
            products: [] // Inicializa un array vacío para los productos del carrito
        };
        this.carts.push(newCart); // Agrega el nuevo carrito al array
        await this.saveCarts(); // Guarda los carritos actualizados
        return newCart; // Retorna el carrito creado
    }

    // Método para obtener un carrito por su ID
    async getCartById(id) {
        const cart = this.carts.find(c => c.id === id); // Busca el carrito por ID
        if (!cart) {
            throw new Error(`Carrito con ID ${id} no encontrado.`);
        }
        return cart; // Retorna el carrito encontrado
    }

    // Método para agregar un producto a un carrito
    async addProductToCart(cartId, productId) {
        const cartIndex = this.carts.findIndex(c => c.id === cartId); // Encuentra el índice del carrito

        if (cartIndex === -1) {
            throw new Error(`Carrito con ID ${cartId} no encontrado.`);
        }

        const cart = this.carts[cartIndex]; // Obtiene el carrito
        const productInCartIndex = cart.products.findIndex(p => p.product === productId); // Busca el producto en el carrito

        if (productInCartIndex !== -1) {
            // Si el producto ya existe en el carrito, incrementa la cantidad
            cart.products[productInCartIndex].quantity++;
        } else {
            // Si el producto no existe, lo agrega con cantidad 1
            cart.products.push({ product: productId, quantity: 1 });
        }

        await this.saveCarts(); // Guarda los carritos actualizados
        return cart; // Retorna el carrito modificado
    }
}

export default CartManager; // Exporta la clase CartManager
