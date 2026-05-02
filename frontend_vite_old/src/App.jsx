import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AffiliateDashboard from './pages/affiliate/AffiliateDashboard';
import AdminPage from './pages/admin/AdminPage';

// Automatically captures ?ref= code from URL and drops it in storage
const GlobalRefTracker = () => {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('affiliate_ref', ref);
  }, []);
  return null;
};

const AppLayout = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <>
      <GlobalRefTracker />
      <Navbar
        cartCount={cartCount}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={
            <div className="section">
              <div className="container container-custom">
                <div className="bento-box" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'var(--space-3)' }}>
                    About <span className="text-accent">SaaS Hub</span>
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '60ch', margin: '0 auto', lineHeight: 1.7 }}>
                    SaaS Hub is a curated marketplace for premium digital tools and subscriptions.
                    We handpick the best software solutions so you don't have to — from CRM platforms
                    to analytics dashboards, every product meets our strict quality standards.
                  </p>
                </div>
              </div>
            </div>
          } />
          <Route path="/contact" element={
            <div className="section">
              <div className="container container-custom">
                <div className="bento-box" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'var(--space-3)' }}>
                    Contact <span className="text-accent">Us</span>
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '50ch', margin: '0 auto', lineHeight: 1.7, marginBottom: 'var(--space-3)' }}>
                    Have questions or need support? Reach out to our team.
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-color)' }}>
                    <i className="bi bi-envelope" style={{ marginRight: '0.4rem' }}></i>
                    support@saashub.com
                  </p>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppLayout />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
