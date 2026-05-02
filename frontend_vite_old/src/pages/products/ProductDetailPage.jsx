import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Section from '../../components/layout/Section';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        fetch(`/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setProduct(data.product);
            })
            .catch(err => console.error('Failed to fetch product:', err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) {
            addToCart({
                ...product,
                image: product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/400`,
            });
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    if (loading) {
        return (
            <Section>
                <Container>
                    <div style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <div style={{
                            width: 40, height: 40, border: '3px solid var(--border-color)',
                            borderTopColor: 'var(--accent-color)', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-3)',
                        }}></div>
                        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Loading product...</p>
                    </div>
                </Container>
            </Section>
        );
    }

    if (!product) {
        return (
            <Section>
                <Container>
                    <div className="bento-box" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#F59E0B', display: 'block', marginBottom: 'var(--space-3)' }}></i>
                        <h2 style={{ fontFamily: 'var(--font-display)' }}>Product Not Found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>The product you're looking for doesn't exist.</p>
                        <Link to="/products"><Button variant="primary">Browse Products</Button></Link>
                    </div>
                </Container>
            </Section>
        );
    }

    const images = product.images?.length > 0
        ? product.images
        : [`https://picsum.photos/seed/${product.id}/600/600`];

    const fullStars = Math.floor(product.rating || 0);
    const hasHalfStar = (product.rating || 0) % 1 >= 0.5;
    const discount = product.comparePrice
        ? Math.round((1 - product.price / product.comparePrice) * 100)
        : null;

    return (
        <Section>
            <Container>
                {/* Breadcrumb */}
                <div style={{
                    display: 'flex', gap: '0.4rem', alignItems: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.75rem',
                    color: 'var(--text-muted)', marginBottom: 'var(--space-4)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', transition: 'color 150ms' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-color)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >Home</Link>
                    <span>/</span>
                    <Link to="/products" style={{ color: 'var(--text-muted)', transition: 'color 150ms' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-color)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >Products</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{product.name}</span>
                </div>

                <div className="bento-grid">
                    {/* Image Gallery */}
                    <div className="bento-col-12 bento-col-6">
                        <div className="bento-box" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Main Image */}
                            <div style={{
                                width: '100%', aspectRatio: '1', background: 'var(--bg-tertiary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', position: 'relative',
                            }}>
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transition: 'transform 400ms ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                {discount && (
                                    <div style={{
                                        position: 'absolute', top: 16, left: 16,
                                        background: '#EF4444', color: '#fff',
                                        fontFamily: 'var(--font-display)', fontSize: '0.75rem',
                                        fontWeight: 700, padding: '0.3rem 0.7rem',
                                        borderRadius: 'var(--radius-sm)',
                                    }}>
                                        -{discount}%
                                    </div>
                                )}
                                {product.badge && (
                                    <div style={{
                                        position: 'absolute', top: 16, right: 16,
                                        background: product.badge === 'new' ? 'var(--accent-color)' : 'var(--accent-secondary)',
                                        color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                                        fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>
                                        {product.badge}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div style={{
                                    display: 'flex', gap: 'var(--space-1)', padding: 'var(--space-2)',
                                    borderTop: '1px solid var(--border-color)',
                                }}>
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            style={{
                                                width: 60, height: 60, borderRadius: 'var(--radius-sm)',
                                                overflow: 'hidden', cursor: 'pointer',
                                                border: i === selectedImage ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                                                padding: 0, background: 'none',
                                                opacity: i === selectedImage ? 1 : 0.6,
                                                transition: 'all 200ms ease',
                                            }}
                                        >
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="bento-col-12 bento-col-6">
                        <div className="bento-box">
                            {/* Category */}
                            <div className="bento-label">
                                <i className="bi bi-tag"></i> {product.category}
                            </div>

                            {/* Title */}
                            <h1 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(1.3rem, 3vw, 2rem)',
                                letterSpacing: '-0.02em',
                                marginBottom: 'var(--space-2)',
                                lineHeight: 1.2,
                            }}>
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                marginBottom: 'var(--space-3)',
                            }}>
                                <div style={{ color: '#F59E0B', display: 'flex', gap: 2 }}>
                                    {[...Array(fullStars)].map((_, i) => (
                                        <i key={i} className="bi bi-star-fill" style={{ fontSize: '0.85rem' }}></i>
                                    ))}
                                    {hasHalfStar && <i className="bi bi-star-half" style={{ fontSize: '0.85rem' }}></i>}
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    ({product.rating}) · {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>

                            {/* Price */}
                            <div style={{
                                display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)',
                                marginBottom: 'var(--space-3)',
                                padding: 'var(--space-3)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                            }}>
                                <span style={{
                                    fontFamily: 'var(--font-display)', fontSize: '2rem',
                                    fontWeight: 700, color: 'var(--accent-color)',
                                }}>
                                    ${product.price?.toFixed(2)}
                                </span>
                                {product.comparePrice && (
                                    <span style={{
                                        fontSize: '1.1rem', color: 'var(--text-muted)',
                                        textDecoration: 'line-through',
                                    }}>
                                        ${product.comparePrice.toFixed(2)}
                                    </span>
                                )}
                                {discount && (
                                    <span style={{
                                        fontSize: '0.8rem', fontFamily: 'var(--font-display)',
                                        color: '#10B981', fontWeight: 600,
                                    }}>
                                        Save ${(product.comparePrice - product.price).toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)', fontSize: '0.8rem',
                                    color: 'var(--text-muted)', textTransform: 'uppercase',
                                    letterSpacing: '0.08em', marginBottom: 'var(--space-2)',
                                }}>
                                    Description
                                </h3>
                                <p style={{
                                    color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem',
                                }}>
                                    {product.description || 'Premium quality product from our curated collection. Built to the highest standards for modern operators who demand excellence.'}
                                </p>
                            </div>

                            {/* Quantity + Add to Cart */}
                            <div style={{
                                display: 'flex', gap: 'var(--space-2)', alignItems: 'center',
                                marginBottom: 'var(--space-3)',
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                }}>
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        style={{
                                            width: 40, height: 40, background: 'var(--bg-tertiary)',
                                            border: 'none', color: 'var(--text-primary)',
                                            cursor: 'pointer', fontSize: '1.1rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >−</button>
                                    <span style={{
                                        width: 48, textAlign: 'center',
                                        fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                                        background: 'var(--bg-primary)',
                                    }}>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        style={{
                                            width: 40, height: 40, background: 'var(--bg-tertiary)',
                                            border: 'none', color: 'var(--text-primary)',
                                            cursor: 'pointer', fontSize: '1.1rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >+</button>
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleAddToCart}
                                    style={{
                                        flex: 1, padding: '0.7rem 1.5rem',
                                        transition: 'all 200ms ease',
                                        background: addedToCart ? '#10B981' : undefined,
                                        borderColor: addedToCart ? '#10B981' : undefined,
                                    }}
                                    disabled={product.stock <= 0}
                                >
                                    {addedToCart ? (
                                        <><i className="bi bi-check-lg"></i> Added!</>
                                    ) : (
                                        <><i className="bi bi-bag-plus"></i> Add to Cart</>
                                    )}
                                </Button>
                            </div>

                            {/* Trust Signals */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 'var(--space-2)', marginTop: 'var(--space-2)',
                            }}>
                                {[
                                    { icon: 'bi-truck', text: 'Free shipping over $50' },
                                    { icon: 'bi-arrow-return-left', text: '30-day returns' },
                                    { icon: 'bi-shield-check', text: 'Secure checkout' },
                                    { icon: 'bi-headset', text: '24/7 support' },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        color: 'var(--text-muted)', fontSize: '0.75rem',
                                        fontFamily: 'var(--font-display)',
                                    }}>
                                        <i className={`bi ${item.icon}`} style={{ color: 'var(--accent-color)', fontSize: '0.85rem' }}></i>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
};

export default ProductDetailPage;
