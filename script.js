// Base de datos de productos con imágenes reales
const products = [
    {
        id: 1,
        name: 'Laptop Pro',
        price: 12999,
        description: 'Laptop de alto rendimiento para trabajo y gaming. Procesador i7, 16GB RAM, SSD 1TB.',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600',
        category: 'Computación',
        stock: 5,
        rating: 4.8,
        featured: true
    },
    {
        id: 2,
        name: 'Smartphone Elite',
        price: 8999,
        description: 'Teléfono inteligente con cámara profesional de 108MP y pantalla AMOLED 6.7".',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600',
        category: 'Móviles',
        stock: 10,
        rating: 4.6,
        featured: true
    },
    {
        id: 3,
        name: 'Auriculares NoiseCancel',
        price: 2499,
        description: 'Sonido premium con cancelación activa de ruido y 30 horas de batería.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600',
        category: 'Audio',
        stock: 15,
        rating: 4.7,
        featured: false
    },
    {
        id: 4,
        name: 'Tablet Design',
        price: 6999,
        description: 'Tablet ligera perfecta para multimedia. Pantalla 10.5" 2K, 128GB almacenamiento.',
        imageUrl: 'https://cdn.thewirecutter.com/wp-content/media/2025/03/BEST-IPAD-2048px-11thgen-pencil.jpg',
        category: 'Tablets',
        stock: 8,
        rating: 4.5,
        featured: true
    },
    {
        id: 5,
        name: 'Smartwatch Pro',
        price: 4999,
        description: 'Monitorea tu salud y notificaciones. GPS integrado y resistencia al agua.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600',
        category: 'Wearables',
        stock: 12,
        rating: 4.4,
        featured: false
    },
    {
        id: 6,
        name: 'Cámara 4K',
        price: 15999,
        description: 'Cámara mirrorless para fotografía profesional. Sensor full frame 24MP.',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600',
        category: 'Fotografía',
        stock: 3,
        rating: 4.9,
        featured: true
    }
];

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos del DOM
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartSummary = document.getElementById('cartSummary');
const subtotal = document.getElementById('subtotal');
const tax = document.getElementById('tax');
const shipping = document.getElementById('shipping');
const discount = document.getElementById('discount');
const total = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const confirmModal = document.getElementById('confirmModal');
const addedModal = document.getElementById('addedModal');
const orderTotal = document.getElementById('orderTotal');
const orderNumber = document.getElementById('orderNumber');
const orderDate = document.getElementById('orderDate');
const orderItems = document.getElementById('orderItems');
const addedProductName = document.getElementById('addedProductName');
const sortProducts = document.getElementById('sortProducts');

// Constantes
const SHIPPING_COST = 50;
const TAX_RATE = 0.16;
const FREE_SHIPPING_MIN = 5000;
const DISCOUNT_PERCENTAGE = 0.10;

// Variables
let currentSort = 'default';

/**
 * Generar número de orden aleatorio
 */
function generateOrderNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

/**
 * Formatear fecha
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Renderizar productos en el catálogo
 */
function renderProducts() {
    productsGrid.innerHTML = '';
    
    let sortedProducts = [...products];
    
    switch(currentSort) {
        case 'price_asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            sortedProducts.sort((a, b) => (b.featured - a.featured) || (b.rating - a.rating));
    }
    
    sortedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const stockClass = product.stock < 5 ? 'low' : '';
        const stockText = product.stock < 5 ? `¡Solo ${product.stock} disponibles!` : `${product.stock} disponibles`;
        const badge = product.featured ? '<div class="product-badge">Destacado</div>' : '';
        
        productCard.innerHTML = `
            ${badge}
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toLocaleString('es-MX')}</p>
                <p class="product-stock ${stockClass}">${stockText}</p>
                <button class="btn-add-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

/**
 * Añadir producto al carrito
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product || product.stock === 0) {
        showNotification('Producto no disponible', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showNotification(`No hay más stock disponible de ${product.name}`, 'warning');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
        });
    }
    
    saveCart();
    renderCart();
    updateCartCount();
    
    addedProductName.textContent = product.name;
    showAddedModal();
    animateCartIcon();
}

/**
 * Mostrar modal de producto agregado
 */
function showAddedModal() {
    addedModal.classList.add('active');
    
    setTimeout(() => {
        if (addedModal.classList.contains('active')) {
            closeAddedModal();
        }
    }, 3000);
}

/**
 * Cerrar modal de producto agregado
 */
function closeAddedModal() {
    addedModal.classList.remove('active');
}

/**
 * Ver carrito
 */
function viewCart() {
    closeAddedModal();
    const cartSection = document.querySelector('.cart-section');
    cartSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Animación del icono del carrito
 */
function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 300);
}

/**
 * Renderizar carrito
 */
function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-basket"></i>
                </div>
                <h3>Tu carrito está vacío</h3>
                <p>Añade productos para comenzar tu compra</p>
                <button class="btn-continue-shopping" onclick="continueShopping()">
                    <i class="fas fa-arrow-left"></i>
                    Continuar Comprando
                </button>
            </div>
        `;
        cartSummary.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = '';
    cartSummary.style.display = 'block';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.imageUrl}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toLocaleString('es-MX')}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="decreaseQuantity(${item.id})">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="increaseQuantity(${item.id})">+</button>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    updateTotals();
}

/**
 * Aumentar cantidad
 */
function increaseQuantity(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem || !product) return;
    
    if (cartItem.quantity >= product.stock) {
        showNotification(`No hay más stock disponible de ${product.name}`, 'warning');
        return;
    }
    
    cartItem.quantity++;
    saveCart();
    renderCart();
    updateCartCount();
}

/**
 * Disminuir cantidad
 */
function decreaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem) return;
    
    if (cartItem.quantity > 1) {
        cartItem.quantity--;
    } else {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    renderCart();
    updateCartCount();
}

/**
 * Eliminar producto del carrito
 */
function removeFromCart(productId) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem && confirm(`¿Eliminar ${cartItem.name} del carrito?`)) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
        updateCartCount();
        showNotification('Producto eliminado del carrito', 'info');
    }
}

/**
 * Actualizar totales
 */
function updateTotals() {
    const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotalAmount * TAX_RATE;
    
    let shippingAmount = SHIPPING_COST;
    if (subtotalAmount >= FREE_SHIPPING_MIN) {
        shippingAmount = 0;
    }
    
    let discountAmount = 0;
    if (subtotalAmount >= 8000) {
        discountAmount = subtotalAmount * DISCOUNT_PERCENTAGE;
    }
    
    const totalAmount = subtotalAmount + taxAmount + shippingAmount - discountAmount;
    
    subtotal.textContent = `$${subtotalAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    tax.textContent = `$${taxAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    shipping.textContent = shippingAmount === 0 ? 'GRATIS' : `$${shippingAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    discount.textContent = `-$${discountAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    total.textContent = `$${totalAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    
    // Actualizar el total en el icono del carrito
    cartTotal.textContent = `$${totalAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    
    const shippingElement = document.getElementById('shipping');
    if (shippingAmount === 0) {
        shippingElement.style.color = 'var(--success-dark)';
        shippingElement.style.fontWeight = '700';
    } else {
        shippingElement.style.color = '';
        shippingElement.style.fontWeight = '';
    }
}

/**
 * Actualizar contador del carrito
 */
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
    
    document.title = count > 0 ? 
        `(${count}) TechShop - Tu Tienda de Tecnología` : 
        'TechShop - Tu Tienda de Tecnología';
}

/**
 * Guardar carrito en localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Vaciar carrito
 */
function clearCart() {
    if (cart.length === 0) {
        showNotification('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de vaciar el carrito? Se perderán todos los productos.')) {
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
        showNotification('Carrito vaciado correctamente', 'success');
    }
}

/**
 * Realizar checkout
 */
function checkout() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'warning');
        return;
    }
    
    // Calcular total
    const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotalAmount * TAX_RATE;
    const shippingAmount = subtotalAmount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
    const discountAmount = subtotalAmount >= 8000 ? subtotalAmount * DISCOUNT_PERCENTAGE : 0;
    const finalTotal = subtotalAmount + taxAmount + shippingAmount - discountAmount;
    
    // Preparar detalles del pedido
    const orderNum = generateOrderNumber();
    const now = new Date();
    
    // Actualizar modal de confirmación
    orderNumber.textContent = orderNum;
    orderDate.textContent = formatDate(now);
    orderItems.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    orderTotal.textContent = `$${finalTotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    
    // Mostrar modal de confirmación
    confirmModal.classList.add('active');
    
    // Limpiar carrito después del pedido
    setTimeout(() => {
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
        
        // *** CORRECCIÓN: Resetear el monto en el header a $0.00 ***
        cartTotal.textContent = '$0.00';
        
        // Mostrar notificación de éxito
        showNotification('¡Pedido realizado con éxito!', 'success');
    }, 500);
}

/**
 * Continuar comprando
 */
function continueShopping() {
    const productsSection = document.querySelector('.products-section');
    productsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Guardar carrito para después
 */
function saveCartForLater() {
    if (cart.length === 0) {
        showNotification('No hay productos para guardar', 'warning');
        return;
    }
    
    showNotification('Carrito guardado para más tarde', 'success');
}

/**
 * Imprimir recibo
 */
function printOrder() {
    window.print();
}

/**
 * Cerrar modal
 */
function closeModal() {
    confirmModal.classList.remove('active');
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Ordenar productos
 */
function sortProductsHandler() {
    currentSort = sortProducts.value;
    renderProducts();
}

/**
 * Inicializar aplicación
 */
function init() {
    renderProducts();
    renderCart();
    updateCartCount();
    
    checkoutBtn.addEventListener('click', checkout);
    clearCartBtn.addEventListener('click', clearCart);
    sortProducts.addEventListener('change', sortProductsHandler);
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            document.querySelector('.cart-section').style.display = 'none';
            document.querySelector('.products-section').style.gridColumn = '1 / -1';
        });
    }
    
    const cartToggle = document.getElementById('cartToggle');
    if (cartToggle && window.innerWidth <= 768) {
        cartToggle.addEventListener('click', function() {
            const cartSection = document.querySelector('.cart-section');
            cartSection.style.display = 'block';
            document.querySelector('.products-section').style.gridColumn = '1';
        });
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 9999;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            border-left: 4px solid var(--gray);
            max-width: 350px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            border-left-color: var(--success-dark);
        }
        
        .notification.error {
            border-left-color: var(--danger);
        }
        
        .notification.warning {
            border-left-color: var(--warning);
        }
        
        .notification.info {
            border-left-color: var(--primary);
        }
        
        .notification i:first-child {
            font-size: 1.2rem;
        }
        
        .notification.success i:first-child {
            color: var(--success-dark);
        }
        
        .notification.error i:first-child {
            color: var(--danger);
        }
        
        .notification.warning i:first-child {
            color: var(--warning);
        }
        
        .notification.info i:first-child {
            color: var(--primary);
        }
        
        .notification span {
            flex: 1;
            font-weight: 500;
        }
        
        .notification button {
            background: none;
            border: none;
            color: var(--gray);
            cursor: pointer;
            padding: 0.2rem;
            border-radius: 4px;
            transition: var(--transition);
        }
        
        .notification button:hover {
            background: var(--gray-light);
            color: var(--dark);
        }
    `;
    document.head.appendChild(style);
    
    console.log('🛒 TechShop inicializado correctamente');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}