// ===================================
// E-Commerce Website - Main JavaScript
// Global Functionality
// ===================================

// Dark Mode Toggle
const initDarkMode = () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const theme = htmlElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update icon
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            }
        });
    }
};

// Mobile Menu Toggle
const initMobileMenu = () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navbarCollapse = document.getElementById('navbarNav');

    if (mobileMenuToggle && navbarCollapse) {
        mobileMenuToggle.addEventListener('click', () => {
            navbarCollapse.classList.toggle('show');
        });
    }
};

// Form Validation
const validateForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
};

// Toast Notification
const showToast = (message, type = 'success') => {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type} animate-slide-in-right`;
    toast.innerHTML = `
    <div class="toast-icon">
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}-fill"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="bi bi-x"></i>
    </button>
  `;

    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
};

const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
    document.body.appendChild(container);
    return container;
};

// Add toast styles dynamically
const addToastStyles = () => {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
    .toast-notification {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 300px;
      max-width: 400px;
      transition: opacity 0.3s ease;
    }
    
    .toast-success {
      border-left: 4px solid var(--success-color);
    }
    
    .toast-error {
      border-left: 4px solid var(--danger-color);
    }
    
    .toast-info {
      border-left: 4px solid var(--info-color);
    }
    
    .toast-icon {
      font-size: 1.5rem;
    }
    
    .toast-success .toast-icon {
      color: var(--success-color);
    }
    
    .toast-error .toast-icon {
      color: var(--danger-color);
    }
    
    .toast-info .toast-icon {
      color: var(--info-color);
    }
    
    .toast-message {
      flex: 1;
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0;
      transition: color 0.2s;
    }
    
    .toast-close:hover {
      color: var(--text-primary);
    }
  `;
    document.head.appendChild(style);
};

// Loading State
const setLoading = (element, isLoading) => {
    if (!element) return;

    if (isLoading) {
        element.disabled = true;
        element.dataset.originalText = element.innerHTML;
        element.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Loading...
    `;
    } else {
        element.disabled = false;
        element.innerHTML = element.dataset.originalText || element.innerHTML;
    }
};

// Update Cart Counter
const updateCartCounter = (count) => {
    const cartCounter = document.getElementById('cartCounter');
    if (cartCounter) {
        cartCounter.textContent = count;
        cartCounter.style.display = count > 0 ? 'flex' : 'none';
    }
};

// Get Cart Count from LocalStorage
const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
};

// Initialize Cart Counter
const initCartCounter = () => {
    updateCartCounter(getCartCount());
};

// Smooth Scroll
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

// Animate on Scroll
const initScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
};

// Password Strength Indicator
const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    return {
        score: strength,
        label: strength <= 1 ? 'Weak' : strength <= 3 ? 'Medium' : 'Strong',
        color: strength <= 1 ? 'danger' : strength <= 3 ? 'warning' : 'success'
    };
};

const initPasswordStrength = () => {
    const passwordInputs = document.querySelectorAll('input[type="password"][data-strength]');

    passwordInputs.forEach(input => {
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength-indicator mt-2';
        strengthIndicator.innerHTML = `
      <div class="strength-bar">
        <div class="strength-bar-fill"></div>
      </div>
      <small class="strength-text"></small>
    `;
        input.parentElement.appendChild(strengthIndicator);

        input.addEventListener('input', (e) => {
            const strength = checkPasswordStrength(e.target.value);
            const fill = strengthIndicator.querySelector('.strength-bar-fill');
            const text = strengthIndicator.querySelector('.strength-text');

            fill.style.width = `${(strength.score / 5) * 100}%`;
            fill.className = `strength-bar-fill bg-${strength.color}`;
            text.textContent = strength.label;
            text.className = `strength-text text-${strength.color}`;
        });
    });
};

// Add password strength styles
const addPasswordStrengthStyles = () => {
    if (document.getElementById('password-strength-styles')) return;

    const style = document.createElement('style');
    style.id = 'password-strength-styles';
    style.textContent = `
    .password-strength-indicator {
      margin-top: 0.5rem;
    }
    
    .strength-bar {
      height: 4px;
      background: var(--bg-secondary);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: 0.25rem;
    }
    
    .strength-bar-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      border-radius: var(--radius-full);
    }
    
    .strength-bar-fill.bg-danger {
      background: var(--danger-color);
    }
    
    .strength-bar-fill.bg-warning {
      background: var(--warning-color);
    }
    
    .strength-bar-fill.bg-success {
      background: var(--success-color);
    }
    
    .strength-text {
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .text-danger {
      color: var(--danger-color);
    }
    
    .text-warning {
      color: var(--warning-color);
    }
    
    .text-success {
      color: var(--success-color);
    }
  `;
    document.head.appendChild(style);
};

// Initialize all features on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initMobileMenu();
    initCartCounter();
    initSmoothScroll();
    initScrollAnimations();
    initPasswordStrength();
    addToastStyles();
    addPasswordStrengthStyles();
});

// Export functions for use in other scripts
window.ecommerce = {
    validateForm,
    showToast,
    setLoading,
    updateCartCounter,
    getCartCount,
    checkPasswordStrength
};
