
import fs from 'fs/promises'; // Importa el módulo 'fs/promises' para operaciones de archivo asíncronas

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath; // Ruta del archivo JSON donde se almacenarán los productos
        this.products = []; // Array para almacenar los productos en memoria
        this.nextId = 1; // Contador para generar IDs únicos
        this.initialize(); // Llama al método de inicialización al crear una instancia
    }

    // Método asíncrono para inicializar el ProductManager
    async initialize() {
        try {
            // Intenta leer el archivo de productos
            const data = await fs.readFile(this.filePath, 'utf8');
            this.products = JSON.parse(data); // Parsea los datos JSON a un array de productos
            // Calcula el siguiente ID disponible basándose en los IDs existentes
            if (this.products.length > 0) {
                this.nextId = Math.max(...this.products.map(p => p.id)) + 1;
            }
            console.log('Productos cargados desde el archivo:', this.filePath);
        } catch (error) {
            // Si el archivo no existe o hay un error al leerlo/parsearlo, inicializa un array vacío
            if (error.code === 'ENOENT') {
                console.log('El archivo de productos no existe, creando uno nuevo:', this.filePath);
                await this.saveProducts(); // Guarda un array vacío para crear el archivo
            } else {
                console.error('Error al inicializar ProductManager:', error);
            }
        }
    }

    // Método privado asíncrono para guardar los productos en el archivo JSON
    async saveProducts() {
        try {
            // Escribe el array de productos en el archivo, formateado para legibilidad
            await fs.writeFile(this.filePath, JSON.stringify(this.products, null, 2), 'utf8');
            console.log('Productos guardados en el archivo:', this.filePath);
        } catch (error) {
            console.error('Error al guardar productos:', error);
            throw new Error('No se pudieron guardar los productos.');
        }
    }

    // Método para agregar un nuevo producto
    async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
        // Valida que todos los campos obligatorios estén presentes
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Todos los campos obligatorios (title, description, code, price, stock, category) son requeridos.');
        }

        // Valida que el código del producto sea único
        if (this.products.some(p => p.code === code)) {
            throw new Error(`El producto con el código '${code}' ya existe.`);
        }

        // Crea el nuevo objeto producto
        const newProduct = {
            id: this.nextId++, // Asigna un ID único y lo incrementa
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        this.products.push(newProduct); // Agrega el nuevo producto al array
        await this.saveProducts(); // Guarda los productos actualizados en el archivo
        return newProduct; // Retorna el producto recién agregado
    }

    // Método para obtener todos los productos
    async getProducts() {
        return this.products; // Retorna el array de productos
    }

    // Método para obtener un producto por su ID
    async getProductById(id) {
        const product = this.products.find(p => p.id === id); // Busca el producto por ID
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado.`);
        }
        return product; // Retorna el producto encontrado
    }

    // Método para actualizar un producto por su ID
    async updateProduct(id, updatedFields) {
        const index = this.products.findIndex(p => p.id === id); // Encuentra el índice del producto

        if (index === -1) {
            throw new Error(`Producto con ID ${id} no encontrado para actualizar.`);
        }

        // Evita que se actualice o elimine el ID
        if (updatedFields.id !== undefined) {
            delete updatedFields.id;
        }

        // Actualiza los campos del producto existente
        this.products[index] = { ...this.products[index], ...updatedFields };
        await this.saveProducts(); // Guarda los productos actualizados
        return this.products[index]; // Retorna el producto actualizado
    }

    // Método para eliminar un producto por su ID
    async deleteProduct(id) {
        const initialLength = this.products.length; // Longitud inicial del array
        this.products = this.products.filter(p => p.id !== id); // Filtra el producto a eliminar

        if (this.products.length === initialLength) {
            throw new Error(`Producto con ID ${id} no encontrado para eliminar.`);
        }

        await this.saveProducts(); // Guarda los productos después de la eliminación
        return { message: `Producto con ID ${id} eliminado exitosamente.` };
    }
}

export default ProductManager; // Exporta la clase ProductManager
