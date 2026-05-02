// ===================================
// E-Commerce Website - Components JavaScript
// Component-specific interactions
// ===================================

// Product Image Gallery
const initProductGallery = () => {
    const mainImage = document.getElementById('productMainImage');
    const thumbnails = document.querySelectorAll('.product-thumbnail');

    if (!mainImage || thumbnails.length === 0) return;

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Update main image
            mainImage.src = thumbnail.dataset.image;

            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });
};

// Quantity Selector
const initQuantitySelectors = () => {
    document.querySelectorAll('.quantity-selector').forEach(selector => {
        const decreaseBtn = selector.querySelector('.quantity-decrease');
        const increaseBtn = selector.querySelector('.quantity-increase');
        const input = selector.querySelector('.quantity-input');

        if (!decreaseBtn || !increaseBtn || !input) return;

        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value) || 1;
            if (currentValue > 1) {
                input.value = currentValue - 1;
                input.dispatchEvent(new Event('change'));
            }
        });

        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value) || 1;
            const maxValue = parseInt(input.max) || 999;
            if (currentValue < maxValue) {
                input.value = currentValue + 1;
                input.dispatchEvent(new Event('change'));
            }
        });

        input.addEventListener('change', () => {
            const value = parseInt(input.value) || 1;
            const min = parseInt(input.min) || 1;
            const max = parseInt(input.max) || 999;

            if (value < min) input.value = min;
            if (value > max) input.value = max;
        });
    });
};

// Add to Cart
const addToCart = (productId, productName, price, image, quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart counter
    if (window.ecommerce && window.ecommerce.updateCartCounter) {
        window.ecommerce.updateCartCounter(window.ecommerce.getCartCount());
    }

    // Show success toast
    if (window.ecommerce && window.ecommerce.showToast) {
        window.ecommerce.showToast(`${productName} added to cart!`, 'success');
    }

    // Add animation to button
    const btn = event.target.closest('.add-to-cart-btn');
    if (btn) {
        btn.classList.add('added');
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Added to Cart';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="bi bi-cart-plus"></i> Add to Cart';
        }, 2000);
    }
};

// Remove from Cart
const removeFromCart = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart counter
    if (window.ecommerce && window.ecommerce.updateCartCounter) {
        window.ecommerce.updateCartCounter(window.ecommerce.getCartCount());
    }

    // Reload cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
};

// Update Cart Item Quantity
const updateCartQuantity = (productId, newQuantity) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart counter
        if (window.ecommerce && window.ecommerce.updateCartCounter) {
            window.ecommerce.updateCartCounter(window.ecommerce.getCartCount());
        }

        // Update cart totals
        updateCartTotals();
    }
};

// Load Cart Items
const loadCartItems = () => {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cart.length === 0) {
        cartContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-cart-x" style="font-size: 4rem; color: var(--text-muted);"></i>
        <h3 class="mt-3">Your cart is empty</h3>
        <p class="text-muted">Add some products to get started!</p>
        <a href="../products/catalog.html" class="btn-custom btn-primary mt-3">
          <i class="bi bi-shop"></i> Continue Shopping
        </a>
      </div>
    `;
        return;
    }

    cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-product-id="${item.id}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <p class="cart-item-meta">Price: $${item.price.toFixed(2)}</p>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button class="quantity-btn quantity-decrease" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">
              <i class="bi bi-dash"></i>
            </button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" 
                   onchange="updateCartQuantity('${item.id}', parseInt(this.value))">
            <button class="quantity-btn quantity-increase" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="cart-item-price">
        <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
          <i class="bi bi-trash"></i> Remove
        </button>
      </div>
    </div>
  `).join('');

    updateCartTotals();
};

// Update Cart Totals
const updateCartTotals = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const shippingEl = document.getElementById('cartShipping');
    const totalEl = document.getElementById('cartTotal');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
};

// Filter Products
const initProductFilters = () => {
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    const sortSelect = document.getElementById('sortSelect');
    const productGrid = document.getElementById('productGrid');

    if (!productGrid) return;

    const filterProducts = () => {
        const selectedCategories = Array.from(filterCheckboxes)
            .filter(cb => cb.checked && cb.dataset.filter === 'category')
            .map(cb => cb.value);

        const selectedPriceRanges = Array.from(filterCheckboxes)
            .filter(cb => cb.checked && cb.dataset.filter === 'price')
            .map(cb => cb.value);

        const products = productGrid.querySelectorAll('.product-card');

        products.forEach(product => {
            const category = product.dataset.category;
            const price = parseFloat(product.dataset.price);

            let showProduct = true;

            if (selectedCategories.length > 0 && !selectedCategories.includes(category)) {
                showProduct = false;
            }

            if (selectedPriceRanges.length > 0) {
                const inPriceRange = selectedPriceRanges.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    return price >= min && (max ? price <= max : true);
                });
                if (!inPriceRange) showProduct = false;
            }

            product.style.display = showProduct ? 'block' : 'none';
        });
    };

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const products = Array.from(productGrid.querySelectorAll('.product-card'));
            const sortValue = e.target.value;

            products.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price);
                const priceB = parseFloat(b.dataset.price);

                switch (sortValue) {
                    case 'price-low':
                        return priceA - priceB;
                    case 'price-high':
                        return priceB - priceA;
                    case 'name':
                        return a.dataset.name.localeCompare(b.dataset.name);
                    default:
                        return 0;
                }
            });

            products.forEach(product => productGrid.appendChild(product));
        });
    }
};

// Wishlist Toggle
const toggleWishlist = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        if (window.ecommerce && window.ecommerce.showToast) {
            window.ecommerce.showToast('Removed from wishlist', 'info');
        }
    } else {
        wishlist.push(productId);
        if (window.ecommerce && window.ecommerce.showToast) {
            window.ecommerce.showToast('Added to wishlist!', 'success');
        }
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // Update button state
    const btn = event.target.closest('.wishlist-btn');
    if (btn) {
        btn.classList.toggle('active');
    }
};

// Initialize all component features
document.addEventListener('DOMContentLoaded', () => {
    initProductGallery();
    initQuantitySelectors();
    initProductFilters();

    // Load cart items if on cart page
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
});

// Export functions
window.ecommerceComponents = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    loadCartItems,
    toggleWishlist
};
