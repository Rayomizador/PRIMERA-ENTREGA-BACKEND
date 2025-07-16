// managers/ProductManager.js
import fs from 'fs/promises'; // Importa el módulo 'fs/promises' para operaciones de archivo asíncronas, importante

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath; // Ruta del archivo JSON donde se almacenarán los productos
        this.products = []; // Array para almacenar los productos en memoria
        this.nextId = 1; // Contador para generar IDs únicos
        this.isInitialized = false; // Nueva bandera para asegurar que la inicialización solo corra una vez
    }

    // Método asíncrono para inicializar el ProductManager
    async initialize() {
        if (this.isInitialized) {
            return; // Si ya está inicializado, no hacer nada (para eficiencia)
        }

        try {
            // Intenta leer el archivo de productos
            const data = await fs.readFile(this.filePath, 'utf8');
            let loadedProducts = JSON.parse(data); // Carga los productos del archivo

            // Procesa los productos cargados: asigna IDs si faltan y actualiza nextId
            this.products = loadedProducts.map(p => {
                if (p.id === undefined || p.id === null || isNaN(p.id)) {
                    // Si el producto no tiene ID o es inválido, asigna uno nuevo
                    p.id = this.nextId++;
                } else {
                    // Si ya tiene un ID válido, asegúrate de que nextId sea mayor
                    if (p.id >= this.nextId) {
                        this.nextId = p.id + 1;
                    }
                }
                return p; // Retorna el producto (con ID asignado si fue necesario)
            });

            // Después de procesar todos los productos cargados, asegúrate de que nextId sea el máximo + 1
            if (this.products.length > 0) {
                const maxExistingId = Math.max(...this.products.map(p => p.id));
                if (maxExistingId >= this.nextId) {
                    this.nextId = maxExistingId + 1;
                }
            }

            console.log('Productos cargados desde el archivo:', this.filePath);
            await this.saveProducts(); // Guarda los productos de nuevo en el archivo (ahora con IDs)
            this.isInitialized = true; // Marca el manager como inicializado

        } catch (error) {
            // Si el archivo no existe o hay un error al leerlo/parsearlo
            if (error.code === 'ENOENT') {
                console.log('El archivo de productos no existe, creando uno nuevo:', this.filePath);
                this.products = []; // Asegura que el array de productos esté vacío
                await this.saveProducts(); // Guarda un array vacío para crear el archivo
                this.isInitialized = true; // Marca el manager como inicializado
            } else {
                console.error('Error al inicializar ProductManager:', error);
                throw new Error('Fallo al inicializar ProductManager.'); // Lanza el error para que sea manejado
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
        // Asegúrate de que el ProductManager esté inicializado antes de agregar
        if (!this.isInitialized) {
            await this.initialize();
        }
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
        // Asegúrate de que el ProductManager esté inicializado antes de obtener
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.products; // Retorna el array de productos
    }

    // Método para obtener un producto por su ID
    async getProductById(id) {
        // Asegúrate de que el ProductManager esté inicializado antes de obtener
        if (!this.isInitialized) {
            await this.initialize();
        }
        const product = this.products.find(p => p.id === id); // Busca el producto por ID
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado.`);
        }
        return product; // Retorna el producto encontrado
    }

    // Método para actualizar un producto por su ID
    async updateProduct(id, updatedFields) {
        // Asegúrate de que el ProductManager esté inicializado antes de actualizar
        if (!this.isInitialized) {
            await this.initialize();
        }
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
        // Asegúrate de que el ProductManager esté inicializado antes de eliminar
        if (!this.isInitialized) {
            await this.initialize();
        }
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
