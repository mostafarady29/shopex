import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';
import NewsletterForm from '../components/form/NewsletterForm';
import Container from '../components/layout/Container';

/* ── Mock Data ──────────────────────────────────────────── */
const MOCK_PRODUCTS = [
    { id: 1, name: 'Ultra Pro Max 5G Smartphone', category: 'Electronics', price: 1200, originalPrice: 1380, image: 'https://picsum.photos/seed/phone1/400/400', rating: 4.8, badge: 'new' },
    { id: 2, name: 'Wireless Noise-Cancel Headphones', category: 'Electronics', price: 299, originalPrice: 399, image: 'https://picsum.photos/seed/headphones1/400/400', rating: 4.6, badge: 'sale' },
    { id: 3, name: 'Running Performance Shoes', category: 'Sports', price: 149, originalPrice: null, image: 'https://picsum.photos/seed/shoes1/400/400', rating: 4.5, badge: null },
    { id: 4, name: 'Smart Watch Series X', category: 'Electronics', price: 449, originalPrice: 599, image: 'https://picsum.photos/seed/watch1/400/400', rating: 4.7, badge: 'sale' },
    { id: 5, name: 'Ergonomic Office Chair', category: 'Home', price: 599, originalPrice: null, image: 'https://picsum.photos/seed/chair1/400/400', rating: 4.4, badge: null },
    { id: 6, name: 'Premium Skincare Set', category: 'Beauty', price: 89, originalPrice: 120, image: 'https://picsum.photos/seed/skincare1/400/400', rating: 4.9, badge: 'sale' },
    { id: 7, name: 'Mechanical Keyboard Pro', category: 'Electronics', price: 189, originalPrice: null, image: 'https://picsum.photos/seed/keyboard1/400/400', rating: 4.6, badge: 'new' },
    { id: 8, name: 'Yoga Mat Premium', category: 'Sports', price: 69, originalPrice: 99, image: 'https://picsum.photos/seed/yoga1/400/400', rating: 4.3, badge: 'sale' },
];

const CATEGORIES = [
    { icon: 'bi-cpu', label: 'Electronics', to: '/products?cat=electronics', color: '#3B82F6' },
    { icon: 'bi-handbag', label: 'Clothing', to: '/products?cat=clothing', color: '#8B5CF6' },
    { icon: 'bi-house', label: 'Home & Kitchen', to: '/products?cat=home', color: '#10B981' },
    { icon: 'bi-bicycle', label: 'Sports & Fitness', to: '/products?cat=sports', color: '#F59E0B' },
    { icon: 'bi-stars', label: 'Beauty & Care', to: '/products?cat=beauty', color: '#EC4899' },
    { icon: 'bi-book', label: 'Books & Media', to: '/products?cat=books', color: '#6366F1' },
];

const TRUST_SIGNALS = [
    { icon: 'bi-truck', label: 'Free Shipping', sub: 'On orders over $50' },
    { icon: 'bi-arrow-return-left', label: 'Easy Returns', sub: '30-day return policy' },
    { icon: 'bi-shield-check', label: 'Secure Payment', sub: '100% protected' },
    { icon: 'bi-headset', label: '24/7 Support', sub: 'Always here to help' },
];

/* ── Styles ─────────────────────────────────────────────── */
const S = {
    section: {
        padding: 'var(--space-5) 0',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
        gap: 'var(--space-2)',
        flexWrap: 'wrap',
    },
    sectionTitle: {
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em',
        margin: 0,
    },
    viewAll: {
        fontFamily: 'var(--font-display)',
        fontSize: '0.75rem',
        color: 'var(--accent-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        transition: 'gap 150ms ease',
    },
};

/* ── Sub-components ─────────────────────────────────────── */

const HeroSection = ({ onShopNow }) => (
    <section
        style={{
            background: `radial-gradient(ellipse 80% 60% at 60% 50%, rgba(59,130,246,0.08) 0%, transparent 70%), var(--bg-primary)`,
            borderBottom: '1px solid var(--border-color)',
            padding: 'var(--space-5) 0',
            overflow: 'hidden',
        }}
    >
        <Container>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'var(--space-4)',
                    alignItems: 'center',
                }}
                className="lg:grid-cols-2"
            >
                {/* Left: copy */}
                <div className="animate-stagger" style={{ maxWidth: 560 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(59,130,246,0.1)',
                            border: '1px solid rgba(59,130,246,0.25)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.3rem 0.8rem',
                            marginBottom: 'var(--space-3)',
                        }}
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-color)', display: 'inline-block' }}></span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--accent-color)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            New Season. New Drops.
                        </span>
                    </div>

                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.05em',
                            lineHeight: 1.1,
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--space-3)',
                        }}
                    >
                        Shop the{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Future
                        </span>
                        ,<br />
                        Own the Edge.
                    </h1>

                    <p
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                            lineHeight: 1.7,
                            marginBottom: 'var(--space-4)',
                            maxWidth: '44ch',
                        }}
                    >
                        Precision-curated products for operators and creators who demand the highest tier of quality.
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <button
                            onClick={onShopNow}
                            style={{
                                background: 'var(--accent-color)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.85rem 1.75rem',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'background 150ms ease',
                                letterSpacing: '0.03em',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-color)')}
                        >
                            <i className="bi bi-bag" aria-hidden="true"></i>
                            Shop Now
                        </button>

                        <Link
                            to="/about"
                            style={{
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.85rem 1.75rem',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'border-color 150ms ease',
                                letterSpacing: '0.03em',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                        >
                            Explore Catalog
                            <i className="bi bi-arrow-right" aria-hidden="true"></i>
                        </Link>
                    </div>

                    {/* Mini stats */}
                    <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                        {[
                            { value: '50K+', label: 'Customers' },
                            { value: '1,200+', label: 'Products' },
                            { value: '4.9★', label: 'Avg Rating' },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: featured image */}
                <div
                    style={{
                        display: 'none',
                        position: 'relative',
                        justifyContent: 'center',
                    }}
                    className="lg:flex"
                >
                    <div
                        style={{
                            width: 420,
                            height: 420,
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            position: 'relative',
                        }}
                    >
                        <img
                            src="https://picsum.photos/seed/herotech/840/840"
                            alt="Featured product"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                        />
                        {/* Floating badge */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 24,
                                left: 24,
                                background: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'var(--accent-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '1rem',
                                }}
                            >
                                <i className="bi bi-lightning-charge-fill" aria-hidden="true"></i>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Flash Deal Active</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--accent-secondary)' }}>Up to 40% off today</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    </section>
);

const TrustBar = () => (
    <div
        style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: 'var(--space-3) 0',
        }}
    >
        <Container>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 'var(--space-3)',
                }}
            >
                {TRUST_SIGNALS.map(({ icon, label, sub }) => (
                    <div
                        key={label}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-color)',
                                fontSize: '1rem',
                                flexShrink: 0,
                            }}
                        >
                            <i className={`bi ${icon}`} aria-hidden="true"></i>
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    </div>
);

const CategoriesSection = () => (
    <section style={S.section}>
        <Container>
            <div style={S.sectionHeader}>
                <h2 style={S.sectionTitle}>Shop by Category</h2>
                <Link
                    to="/products"
                    style={S.viewAll}
                    onMouseEnter={e => (e.currentTarget.style.gap = '0.5rem')}
                    onMouseLeave={e => (e.currentTarget.style.gap = '0.3rem')}
                >
                    View All <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </Link>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 'var(--space-3)',
                }}
            >
                {CATEGORIES.map(({ icon, label, to, color }) => (
                    <Link
                        key={label}
                        to={to}
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-4) var(--space-3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            textAlign: 'center',
                            transition: 'border-color 200ms ease, background 200ms ease, transform 200ms ease',
                            cursor: 'pointer',
                            textDecoration: 'none',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = color;
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-md)',
                                background: `${color}18`,
                                border: `1px solid ${color}30`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color,
                                fontSize: '1.3rem',
                            }}
                        >
                            <i className={`bi ${icon}`} aria-hidden="true"></i>
                        </div>
                        <span
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                letterSpacing: '0.01em',
                            }}
                        >
                            {label}
                        </span>
                    </Link>
                ))}
            </div>
        </Container>
    </section>
);

const FeaturedProducts = ({ onAddToCart }) => (
    <section style={{ ...S.section, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <Container>
            <div style={S.sectionHeader}>
                <h2 style={S.sectionTitle}>Featured Products</h2>
                <Link
                    to="/products"
                    style={S.viewAll}
                    onMouseEnter={e => (e.currentTarget.style.gap = '0.5rem')}
                    onMouseLeave={e => (e.currentTarget.style.gap = '0.3rem')}
                >
                    View All Products <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </Link>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 'var(--space-3)',
                }}
            >
                {MOCK_PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
            </div>
        </Container>
    </section>
);

const PromoBanner = () => (
    <section style={S.section}>
        <Container>
            <div
                style={{
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--accent-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-5) var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 260,
                        height: 260,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        width: 'fit-content',
                    }}
                >
                    <i className="bi bi-lightning-charge-fill" style={{ color: '#F59E0B', fontSize: '0.9rem' }} aria-hidden="true"></i>
                    <span
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.7rem',
                            color: '#F59E0B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600,
                        }}
                    >
                        Flash Sale
                    </span>
                </div>

                <h2
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.04em',
                        margin: 0,
                        background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--accent-color) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        maxWidth: '20ch',
                    }}
                >
                    Flash Sale — Up to 40% Off
                </h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '50ch', margin: 0 }}>
                    Limited time offer. Ends midnight. Don't miss out on top-tier products at unbeatable prices.
                </p>

                <div>
                    <Link
                        to="/products?filter=sale"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'var(--accent-color)',
                            color: '#fff',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.75rem 1.5rem',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            transition: 'background 150ms ease',
                            letterSpacing: '0.03em',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-color)')}
                    >
                        <i className="bi bi-tag" aria-hidden="true"></i>
                        Shop the Sale
                    </Link>
                </div>
            </div>
        </Container>
    </section>
);

/* ── Main Page ──────────────────────────────────────────── */
const HomePage = () => {
    const { addToCart } = useCart();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const handleShopNow = () => navigate('/products');

    return (
        <div style={{ minHeight: '100vh' }}>
            <HeroSection onShopNow={handleShopNow} />
            <TrustBar />
            <CategoriesSection />
            <FeaturedProducts onAddToCart={addToCart} />
            <PromoBanner />
            <NewsletterForm />
        </div>
    );
};

export default HomePage;
