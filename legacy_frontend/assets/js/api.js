// ===================================
// E-Commerce API Service Layer
// Handles all backend communication
// ===================================

const API_BASE_URL = 'http://localhost:5000/api';
const USE_MOCK_DATA = true; // Set to false when backend is ready

// ===================================
// Helper Functions
// ===================================

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set auth token
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Remove auth token
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Remove current user
function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

// Make API request with error handling
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===================================
// Mock Data (for development without backend)
// ===================================

const mockProducts = [
    {
        _id: 'prod-1',
        name: 'SaaS CRM Pro',
        description: 'Intelligent CRM driving revenue and growth.',
        category: 'Subscriptions',
        price: 99.99,
        originalPrice: null,
        image: 'assets/images/product_headphones_1768510726683.png',
        images: ['assets/images/product_headphones_1768510726683.png'],
        rating: 4.9,
        numReviews: 342,
        stock: 999,
        badge: 'popular'
    },
    {
        _id: 'prod-2',
        name: 'SaaS CRM Starter',
        description: 'Affordable CRM tools for small teams.',
        category: 'Subscriptions',
        price: 29.99,
        image: 'assets/images/product_smartwatch_1768510745513.png',
        images: ['assets/images/product_smartwatch_1768510745513.png'],
        rating: 4.6,
        numReviews: 215,
        stock: 999,
        badge: 'new'
    },
    {
        _id: 'prod-3',
        name: 'Email Marketing Plugin',
        description: 'Drag and drop builder for automated marketing sequences.',
        category: 'Plugins',
        price: 49.99,
        image: 'assets/images/product_laptop_1768510763985.png',
        images: ['assets/images/product_laptop_1768510763985.png'],
        rating: 4.7,
        numReviews: 89,
        stock: 999
    },
    {
        _id: 'prod-4',
        name: 'Advanced Analytics Dashboard',
        description: 'Real-time metrics and funnel tracking.',
        category: 'Plugins',
        price: 199.99,
        originalPrice: 249.99,
        image: 'assets/images/product_camera_1768510785099.png',
        images: ['assets/images/product_camera_1768510785099.png'],
        rating: 4.9,
        numReviews: 50,
        stock: 999,
        badge: 'sale'
    },
    {
        _id: 'prod-5',
        name: 'SaaS Landing Page Template',
        description: 'High converting Next.js landing page template.',
        category: 'Templates',
        price: 89.99,
        image: 'assets/images/product_sneakers_1768510804610.png',
        images: ['assets/images/product_sneakers_1768510804610.png'],
        rating: 4.8,
        numReviews: 120,
        stock: 999
    },
    {
        _id: 'prod-6',
        name: 'Admin Dashboard UI Kit',
        description: 'Comprehensive UI kit for internal tools.',
        category: 'Templates',
        price: 149.99,
        image: 'assets/images/product_backpack_1768510823779.png',
        images: ['assets/images/product_backpack_1768510823779.png'],
        rating: 4.9,
        numReviews: 310,
        stock: 999
    }
];

const mockUser = {
    _id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
};

// ===================================
// Authentication API
// ===================================

const authAPI = {
    // Register new user
    async register(userData) {
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const user = { ...mockUser, ...userData };
            const token = 'mock_token_' + Date.now();

            setAuthToken(token);
            setCurrentUser(user);

            return { success: true, data: { user, token } };
        }

        return await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Login user
    async login(email, password) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const user = mockUser;
            const token = 'mock_token_' + Date.now();

            setAuthToken(token);
            setCurrentUser(user);

            return { success: true, data: { user, token } };
        }

        return await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    // Logout user
    logout() {
        removeAuthToken();
        removeCurrentUser();
    },

    // Get current user
    async getMe() {
        if (USE_MOCK_DATA) {
            return { success: true, data: getCurrentUser() };
        }

        return await apiRequest('/auth/me');
    },

    // Check if user is logged in
    isAuthenticated() {
        return !!getAuthToken();
    },

    // Check if user is admin
    isAdmin() {
        const user = getCurrentUser();
        return user && user.role === 'admin';
    }
};

// ===================================
// Products API
// ===================================

const productsAPI = {
    // Get all products with filters
    async getProducts(filters = {}) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));

            let products = [...mockProducts];

            // Apply category filter
            if (filters.category) {
                products = products.filter(p => p.category === filters.category);
            }

            // Apply price filter
            if (filters.minPrice) {
                products = products.filter(p => p.price >= filters.minPrice);
            }
            if (filters.maxPrice) {
                products = products.filter(p => p.price <= filters.maxPrice);
            }

            // Apply search
            if (filters.search) {
                const search = filters.search.toLowerCase();
                products = products.filter(p =>
                    p.name.toLowerCase().includes(search) ||
                    p.description.toLowerCase().includes(search)
                );
            }

            // Apply sorting
            if (filters.sort === 'price-low') {
                products.sort((a, b) => a.price - b.price);
            } else if (filters.sort === 'price-high') {
                products.sort((a, b) => b.price - a.price);
            } else if (filters.sort === 'name') {
                products.sort((a, b) => a.name.localeCompare(b.name));
            }

            return {
                success: true,
                data: products,
                count: products.length,
                pagination: {
                    page: 1,
                    pages: 1
                }
            };
        }

        const queryString = new URLSearchParams(filters).toString();
        return await apiRequest(`/products?${queryString}`);
    },

    // Get single product
    async getProduct(id) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 200));

            const product = mockProducts.find(p => p._id === id);
            if (!product) {
                throw new Error('Product not found');
            }

            return { success: true, data: product };
        }

        return await apiRequest(`/products/${id}`);
    },

    // Create product (admin only)
    async createProduct(productData) {
        return await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    // Update product (admin only)
    async updateProduct(id, productData) {
        return await apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },

    // Delete product (admin only)
    async deleteProduct(id) {
        return await apiRequest(`/products/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===================================
// Orders API
// ===================================

const ordersAPI = {
    // Create new order
    async createOrder(orderData) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const order = {
                _id: 'order-' + Date.now(),
                ...orderData,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            return { success: true, data: order };
        }

        return await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // Get user's orders
    async getMyOrders() {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));

            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            return { success: true, data: orders };
        }

        return await apiRequest('/orders/user/me');
    },

    // Get single order
    async getOrder(id) {
        if (USE_MOCK_DATA) {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const order = orders.find(o => o._id === id);

            if (!order) {
                throw new Error('Order not found');
            }

            return { success: true, data: order };
        }

        return await apiRequest(`/orders/${id}`);
    },

    // Get all orders (admin only)
    async getAllOrders() {
        return await apiRequest('/orders');
    },

    // Update order status (admin only)
    async updateOrderStatus(id, status) {
        return await apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
};

// ===================================
// Admin API
// ===================================

const adminAPI = {
    // Get dashboard statistics
    async getStats() {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));

            return {
                success: true,
                data: {
                    totalRevenue: 15420.50,
                    totalOrders: 127,
                    totalProducts: mockProducts.length,
                    totalUsers: 342,
                    recentOrders: []
                }
            };
        }

        return await apiRequest('/admin/stats');
    },

    // Get all users
    async getUsers() {
        return await apiRequest('/admin/users');
    },

    // Update user
    async updateUser(id, userData) {
        return await apiRequest(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    // Delete user
    async deleteUser(id) {
        return await apiRequest(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===================================
// File Upload API
// ===================================

const uploadAPI = {
    async uploadImages(files) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        return await response.json();
    }
};

// ===================================
// Export API
// ===================================

window.ecommerceAPI = {
    auth: authAPI,
    products: productsAPI,
    orders: ordersAPI,
    admin: adminAPI,
    upload: uploadAPI,
    // Helper functions
    getAuthToken,
    setAuthToken,
    removeAuthToken,
    getCurrentUser,
    setCurrentUser,
    removeCurrentUser
};

console.log('E-Commerce API Service loaded. Use window.ecommerceAPI to access API functions.');
console.log('Mock data mode:', USE_MOCK_DATA ? 'ENABLED' : 'DISABLED');
