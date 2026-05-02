import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';
import Button from '../ui/Button';

const Navbar = ({ cartCount, toggleDarkMode, isDarkMode }) => {
    return (
        <nav className="navbar-custom">
            <Container className="d-flex align-center justify-between">
                <Link className="navbar-brand" to="/">
                    <i className="bi bi-hexagon-fill"></i> SaaS<span className="text-accent">Hub</span>
                </Link>

                <div className="nav-desktop">
                    <Link className="nav-link" to="/">Home</Link>
                    <Link className="nav-link" to="/products">Products</Link>
                    <Link className="nav-link" to="/about">About</Link>

                    <div className="d-flex align-center gap-3" style={{ marginLeft: 'var(--space-4)' }}>
                        {/* The luxury aesthetic stays dark mostly, but keeping the toggle for functionality */}
                        <button
                            type="button"
                            aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
                            onClick={toggleDarkMode}
                            className="btn-icon"
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            <i className={isDarkMode ? "bi bi-sun" : "bi bi-moon"}></i>
                        </button>

                        <Link to="/cart" style={{ position: 'relative', color: 'var(--text-primary)' }}>
                            <i className="bi bi-cart2" style={{ fontSize: '1.2rem' }}></i>
                            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                        </Link>

                        <Link to="/login">
                            <Button>Login</Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </nav>
    );
};

export default Navbar;

