// Conexión del cliente con el servidor de Socket.io
const socket = io();

// --- Elementos del DOM ---
const productsList = document.getElementById('products-list');
const addProductForm = document.getElementById('add-product-form');

// --- Lógica para Agregar Producto ---
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(addProductForm);
    const product = {
        title: formData.get('title'),
        description: formData.get('description'),
        code: formData.get('code'),
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        category: formData.get('category'),
    };
    
    fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            addProductForm.reset();
        }
    })
    .catch(err => console.error(err));
});

// --- Lógica para Eliminar Producto (NUEVA Y MEJORADA) ---
productsList.addEventListener('click', (e) => {
    // Nos aseguramos de que el clic fue en un botón de eliminar
    if (e.target.classList.contains('delete-btn')) {
        // Obtenemos el ID desde el atributo 'data-id' del elemento <li> padre
        const productId = e.target.closest('li').dataset.id;
        
        fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            }
            // No es necesario hacer nada más, el servidor nos enviará la lista actualizada
        })
        .catch(err => console.error(err));
    }
});


// --- Lógica para Sockets ---
socket.on('updateProducts', (products) => {
    productsList.innerHTML = ''; // Limpiar la lista

    if (products.length > 0) {
        products.forEach(product => {
            const productItem = document.createElement('li');
            productItem.id = `product-${product.id}`;
            // Guardamos el ID en un atributo 'data-id'
            productItem.dataset.id = product.id; 
            productItem.innerHTML = `
                <span>
                    <strong>${product.title}</strong> (ID: ${product.id}) - Precio: $${product.price}
                </span>
                <button class="delete-btn">Eliminar</button>
            `;
            productsList.appendChild(productItem);
        });
    } else {
        productsList.innerHTML = '<p>No hay productos para mostrar.</p>';
    }
});