import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductManager {
    constructor(filePath) {
        this.path = path.join(__dirname, '..', 'data', filePath);
    }

    async _readData() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') return []; // Si el archivo no existe, devuelve vacío
            throw error; // Si es otro error, lánzalo
        }
    }

    async _writeData(data) {
        await fs.writeFile(this.path, JSON.stringify(data, null, 2));
    }

    async getProducts() {
        return await this._readData();
    }

    async getProductById(id) {
        const products = await this._readData();
        const product = products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }
        return product;
    }

    async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            throw new Error('Todos los campos obligatorios deben ser proporcionados.');
        }

        const products = await this._readData();
        if (products.some(p => p.code === code)) {
            throw new Error(`Ya existe un producto con el código ${code}.`);
        }

        const newProduct = {
            id: randomUUID(),
            title,
            description,
            code,
            price: Number(price),
            status: Boolean(status),
            stock: Number(stock),
            category,
            thumbnails
        };

        products.push(newProduct);
        await this._writeData(products);
        return newProduct;
    }

    async updateProduct(id, fieldsToUpdate) {
        const products = await this._readData();
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }

        const product = products[productIndex];
        // Eliminar el campo id de los campos a actualizar para que no se pueda modificar
        delete fieldsToUpdate.id;

        const updatedProduct = { ...product, ...fieldsToUpdate };
        products[productIndex] = updatedProduct;

        await this._writeData(products);
        return updatedProduct;
    }

    async deleteProduct(id) {
        let products = await this._readData();
        const initialLength = products.length;
        products = products.filter(p => p.id !== id);

        if (products.length === initialLength) {
            throw new Error(`Producto con id ${id} no encontrado para eliminar.`);
        }

        await this._writeData(products);
        return { id };
    }
}

export const productManager = new ProductManager('products.json');