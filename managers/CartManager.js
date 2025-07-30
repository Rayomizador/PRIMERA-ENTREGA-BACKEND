import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { productManager } from './ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CartManager {
    constructor(filePath) {
        this.path = path.join(__dirname, '..', 'data', filePath);
    }

    async _readData() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') return [];
            throw error;
        }
    }

    async _writeData(data) {
        await fs.writeFile(this.path, JSON.stringify(data, null, 2));
    }

    async createCart() {
        const carts = await this._readData();
        const newCart = {
            id: randomUUID(),
            products: []
        };
        carts.push(newCart);
        await this._writeData(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this._readData();
        const cart = carts.find(c => c.id === id);
        if (!cart) {
            throw new Error(`Carrito con id ${id} no encontrado.`);
        }
        return cart;
    }

    async addProductToCart(cartId, productId) {
        // Verificar si el producto existe
        await productManager.getProductById(productId);

        const carts = await this._readData();
        const cartIndex = carts.findIndex(c => c.id === cartId);

        if (cartIndex === -1) {
            throw new Error(`Carrito con id ${cartId} no encontrado.`);
        }

        const cart = carts[cartIndex];
        const productInCartIndex = cart.products.findIndex(p => p.product === productId);

        if (productInCartIndex > -1) {
            // Si el producto ya existe, incrementar cantidad
            cart.products[productInCartIndex].quantity++;
        } else {
            // Si no existe, agregarlo
            cart.products.push({ product: productId, quantity: 1 });
        }

        carts[cartIndex] = cart;
        await this._writeData(carts);
        return cart;
    }
}

export const cartManager = new CartManager('carts.json');