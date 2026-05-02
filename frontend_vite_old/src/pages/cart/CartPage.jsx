import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Section from '../../components/layout/Section';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartCount } = useCart();

    const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.14;
    const total = subtotal + shipping + tax;

    return (
        <Section>
            <Container>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="bento-label" style={{ marginBottom: 'var(--space-2)' }}>
                        <i className="bi bi-bag"></i> SHOPPING CART
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}>
                        Your <span className="text-accent">Cart</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                        {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
                    </p>
                </div>

                {cart.length === 0 ? (
                    <div className="bento-box" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <i className="bi bi-bag-x" style={{ fontSize: '3rem', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-3)' }}></i>
                        <h3 style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>
                            Your cart is empty
                        </h3>
                        <Link to="/products">
                            <Button variant="primary">Browse Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bento-grid">
                        {/* Cart Items */}
                        <div className="bento-col-12 bento-col-8">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {cart.map(item => (
                                    <div key={item.id} className="bento-box" style={{
                                        display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                                        padding: 'var(--space-3)',
                                    }}>
                                        {/* Image */}
                                        <div style={{
                                            width: 80, height: 80, borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden', flexShrink: 0,
                                            background: 'var(--bg-tertiary)',
                                        }}>
                                            <img
                                                src={item.image || item.images?.[0] || `https://picsum.photos/seed/${item.id}/160/160`}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                                                {item.name}
                                            </h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}>
                                                {item.category}
                                            </p>
                                        </div>

                                        {/* Quantity */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                                                    color: 'var(--text-primary)', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >−</button>
                                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', minWidth: 24, textAlign: 'center' }}>
                                                {item.quantity || 1}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                                                    color: 'var(--text-primary)', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >+</button>
                                        </div>

                                        {/* Price */}
                                        <div style={{ textAlign: 'right', minWidth: 80 }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                                                ${(item.price * (item.quantity || 1)).toFixed(2)}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                ${item.price.toFixed(2)} each
                                            </div>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            style={{
                                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                                cursor: 'pointer', fontSize: '1rem', padding: '0.3rem',
                                                transition: 'color 150ms',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bento-col-12 bento-col-4">
                            <div className="bento-box" style={{ position: 'sticky', top: 'var(--space-4)' }}>
                                <div className="bento-label" style={{ marginBottom: 'var(--space-3)' }}>
                                    <i className="bi bi-receipt"></i> ORDER SUMMARY
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <span>Shipping</span>
                                        <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <span>Tax (14%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div style={{
                                        borderTop: '1px solid var(--border-color)',
                                        paddingTop: 'var(--space-2)',
                                        marginTop: 'var(--space-2)',
                                        display: 'flex', justifyContent: 'space-between',
                                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
                                    }}>
                                        <span>Total</span>
                                        <span className="text-accent">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button variant="primary" style={{ width: '100%', marginTop: 'var(--space-3)' }}>
                                    <i className="bi bi-lock" style={{ marginRight: '0.4rem' }}></i>
                                    Proceed to Checkout
                                </Button>

                                {subtotal < 100 && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                                        Add ${(100 - subtotal).toFixed(2)} more for free shipping
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </Section>
    );
};

export default CartPage;
