// Arreglo global para almacenar los productos en el carrito
let cart = [];

// Función para agregar productos al carrito (agrupando por cantidad)
function addToCart(name, price, imgSrc) {
    const existingProduct = cart.find(item => item.name === name);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            imgSrc: imgSrc,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
}

// Función para cambiar las cantidades directamente desde los botones + y - del carrito
function changeQuantity(name, change, event) {
    if (event) event.stopPropagation(); // Evita que se cierre el carrito al hacer click en los botones

    const product = cart.find(item => item.name === name);
    if (product) {
        product.quantity += change;
        
        if (product.quantity <= 0) {
            removeFromCart(name, event);
            return;
        }
    }
    saveCart();
    updateCartUI();
}

// Función para eliminar completamente un producto del carrito
function removeFromCart(name, event) {
    if (event) event.stopPropagation(); // Evita que se cierre el carrito al eliminar un producto
    
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartUI();
}

// Guardar en almacenamiento local
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cargar carrito al iniciar
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Actualizar toda la interfaz visual del carrito
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalVal = document.getElementById('cart-total-val');

    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';

    let total = 0;
    let totalItemsCount = 0;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity; // Calculamos el precio total de este postre
        total += itemSubtotal;
        totalItemsCount += item.quantity;

        const li = document.createElement('li');
        li.className = 'cart-item-row';
        li.innerHTML = `
            <div class="cart-item-left">
                <img src="${item.imgSrc}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-header">
                        <span class="cart-item-name">
                            ${item.name} <span class="cart-item-qty-badge">x${item.quantity}</span>
                        </span>
                        <!-- El zafacón arriba, al lado del nombre -->
                        <span class="cart-item-delete" onclick="removeFromCart('${item.name}', event)">🗑️</span>
                    </div>
                    <div class="cart-item-details-row">
                        <!-- Mostramos el precio total acumulado de este producto (Ej: $300) -->
                        <span class="cart-item-price">$${itemSubtotal}</span>
                        <div class="quantity-controls">
                            <button class="qty-btn minus" onclick="changeQuantity('${item.name}', -1, event)">−</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn plus" onclick="changeQuantity('${item.name}', 1, event)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(li);
    });

    if (cartCount) {
        cartCount.textContent = totalItemsCount;
    }

    if (cartTotalVal) {
        cartTotalVal.textContent = total;
    }
}

// ==========================================
// CONTROL DEL MENÚ Y DEL CARRITO LATERAL
// ==========================================

function toggleMenu(event) {
    if (event) event.stopPropagation();
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function toggleCart(event) {
    if (event) event.stopPropagation();
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
    }
}

// Cerrar menús al hacer clic fuera de ellos
document.addEventListener('click', function(event) {
    const cartSidebar = document.getElementById('cartSidebar');
    const sidebar = document.getElementById('sidebar');
    const cartIcon = document.querySelector('.cart-icon');
    const menuToggle = document.querySelector('.menu-toggle');

    // Cerrar carrito
    if (cartSidebar && cartSidebar.classList.contains('active')) {
        if (!cartSidebar.contains(event.target) && (!cartIcon || !cartIcon.contains(event.target))) {
            cartSidebar.classList.remove('active');
        }
    }

    // Cerrar menú sidebar
    if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && (!menuToggle || !menuToggle.contains(event.target))) {
            sidebar.classList.remove('active');
        }
    }
});

// ==========================================
// SISTEMA DE ALERTAS PREMIUM (DISEÑO PERSONALIZADO)
// ==========================================

function showModal(mensaje) {
    let modal = document.getElementById('custom-alert-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'custom-alert-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal-card">
                <span class="custom-modal-warning-icon">⚠️</span>
                <p id="custom-modal-text" class="custom-modal-message"></p>
                <button class="custom-modal-btn" onclick="closeCustomModal()">Entendido</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('custom-modal-text').innerText = mensaje;
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeCustomModal() {
    const modal = document.getElementById('custom-alert-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }
}

// Compatibilidad con checkout
function showAlert(mensaje) {
    showModal(mensaje);
}

function closeAlert() {
    closeCustomModal();
}

// ==========================================
// PROCEDER AL PAGO (index.html -> checkout.html)
// ==========================================
function goToCheckout() {
    let totalProductsCount = 0;
    cart.forEach(item => {
        totalProductsCount += item.quantity;
    });

    if (totalProductsCount === 0) {
        showModal("Tu carrito está vacío. Agrega algún postre antes de pagar.");
        return;
    }

    // Tu regla de negocio: mínimo 3 artículos en total para hacer pedidos
    if (totalProductsCount < 3) {
        showModal("Debes agregar un mínimo de 3 artículos al carrito para proceder con tu orden.");
        return;
    }

    // 1. Guardamos el carrito más actualizado en el localStorage
    saveCart();

    // 2. Redireccionamos a la pantalla de pago sin interferencias de código roto
    window.location.href = "checkout.html";
}