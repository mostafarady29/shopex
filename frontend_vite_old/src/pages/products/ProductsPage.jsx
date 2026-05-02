import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Section from '../../components/layout/Section';
import Container from '../../components/layout/Container';
import ProductCard from '../../components/product/ProductCard';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();

    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);
        params.set('page', page);
        params.set('limit', 12);

        fetch(`/api/products?${params}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.products);
                    setPagination(data.pagination);
                }
            })
            .catch(err => console.error('Failed to fetch products:', err))
            .finally(() => setLoading(false));
    }, [category, search, sort, page]);

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        params.set('page', '1');
        setSearchParams(params);
    };

    const [searchInput, setSearchInput] = useState(search);

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilter('search', searchInput);
    };

    const categories = ['Electronics', 'Subscriptions', 'Templates', 'Plugins'];
    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'price-low', label: 'Price: Low → High' },
        { value: 'price-high', label: 'Price: High → Low' },
        { value: 'rating', label: 'Top Rated' },
    ];

    return (
        <Section>
            <Container>
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="bento-label" style={{ marginBottom: 'var(--space-2)' }}>
                        <i className="bi bi-grid-3x3-gap"></i> PRODUCT CATALOG
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}>
                        Browse <span className="text-accent">Products</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                        {pagination.total} products available
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="bento-box" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Search */}
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-2)', flex: '1 1 280px' }}>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder="Search products..."
                                style={{
                                    flex: 1,
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.5rem 0.75rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.875rem',
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-custom btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            >
                                <i className="bi bi-search"></i>
                            </button>
                        </form>

                        {/* Category */}
                        <select
                            value={category}
                            onChange={e => updateFilter('category', e.target.value)}
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.5rem 0.75rem',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={sort}
                            onChange={e => updateFilter('sort', e.target.value)}
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.5rem 0.75rem',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            {sortOptions.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-5)', color: 'var(--accent-color)', fontFamily: 'var(--font-display)' }}>
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="bento-box" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>No products found</p>
                    </div>
                ) : (
                    <div className="product-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: 'var(--space-3)',
                    }}>
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    ...product,
                                    image: product.images?.[0] || 'https://picsum.photos/seed/' + product.id + '/400/400',
                                    originalPrice: product.comparePrice,
                                }}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('page', p);
                                    setSearchParams(params);
                                }}
                                className={`btn-custom ${p === pagination.page ? 'btn-primary' : 'btn-outline-primary'}`}
                                style={{ minWidth: 36, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </Container>
        </Section>
    );
};

export default ProductsPage;
