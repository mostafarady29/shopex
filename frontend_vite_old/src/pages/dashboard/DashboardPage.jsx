import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Section from '../../components/layout/Section';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';

const DashboardPage = () => {
    const { user, token, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) { setLoading(false); return; }

        fetch('/api/orders/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setOrders(data.orders);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token]);

    if (!isAuthenticated) {
        return (
            <Section>
                <Container>
                    <div className="bento-box" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <i className="bi bi-lock" style={{ fontSize: '3rem', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-3)' }}></i>
                        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>Authentication Required</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Please log in to access your dashboard.</p>
                        <Link to="/login"><Button variant="primary">Login</Button></Link>
                    </div>
                </Container>
            </Section>
        );
    }

    const statusColors = {
        pending: '#F59E0B',
        processing: '#3B82F6',
        completed: '#10B981',
        cancelled: '#EF4444',
    };

    return (
        <Section>
            <Container>
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="bento-label" style={{ marginBottom: 'var(--space-2)' }}>
                        <i className="bi bi-speedometer2"></i> USER DASHBOARD
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}>
                        Welcome, <span className="text-accent">{user?.firstName}</span>
                    </h1>
                </div>

                <div className="bento-grid">
                    {/* User Info Card */}
                    <div className="bento-col-12 bento-col-4 bento-box">
                        <div className="bento-label"><i className="bi bi-person-circle"></i> PROFILE</div>
                        <div style={{ marginTop: 'var(--space-3)' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'var(--accent-color)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
                                marginBottom: 'var(--space-3)',
                            }}>
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.2rem' }}>
                                {user?.firstName} {user?.lastName}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
                            <div style={{
                                marginTop: 'var(--space-2)',
                                display: 'inline-block',
                                background: 'rgba(59,130,246,0.1)',
                                border: '1px solid rgba(59,130,246,0.2)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.2rem 0.6rem',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.7rem',
                                color: 'var(--accent-color)',
                                textTransform: 'uppercase',
                            }}>
                                {user?.role}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bento-col-12 bento-col-4 bento-box">
                        <div className="bento-label"><i className="bi bi-bar-chart"></i> STATS</div>
                        <div className="bento-value" style={{ marginTop: 'var(--space-3)' }}>{orders.length}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Orders</p>

                        <div className="bento-value" style={{ marginTop: 'var(--space-3)' }}>
                            ${orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Spent</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="bento-col-12 bento-col-4 bento-box">
                        <div className="bento-label"><i className="bi bi-lightning"></i> QUICK ACTIONS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                            <Link to="/products">
                                <Button variant="primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                                    <i className="bi bi-bag" style={{ marginRight: '0.4rem' }}></i> Browse Products
                                </Button>
                            </Link>
                            <Link to="/affiliate/dashboard">
                                <Button variant="outline-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                                    <i className="bi bi-link-45deg" style={{ marginRight: '0.4rem' }}></i> Affiliate Dashboard
                                </Button>
                            </Link>
                            {(user?.role === 'admin' || user?.role === 'moderator') && (
                                <Link to="/admin">
                                    <Button variant="outline-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                                        <i className="bi bi-gear" style={{ marginRight: '0.4rem' }}></i> Admin Panel
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="bento-col-12 bento-box">
                        <div className="bento-label" style={{ marginBottom: 'var(--space-3)' }}>
                            <i className="bi bi-receipt"></i> RECENT ORDERS
                        </div>

                        {loading ? (
                            <p style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-display)' }}>Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                <i className="bi bi-inbox" style={{ fontSize: '2rem', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}></i>
                                <p style={{ color: 'var(--text-secondary)' }}>No orders yet</p>
                                <Link to="/products" style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                                    Start shopping →
                                </Link>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            {['Order ID', 'Items', 'Total', 'Status', 'Date'].map(h => (
                                                <th key={h} style={{
                                                    fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                                                    color: 'var(--text-muted)', textTransform: 'uppercase',
                                                    letterSpacing: '0.08em', padding: '0.6rem 0.8rem',
                                                    textAlign: 'left',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '0.7rem 0.8rem', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                                                    {order.orderId}
                                                </td>
                                                <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                                </td>
                                                <td style={{ padding: '0.7rem 0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    ${order.total?.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '0.7rem 0.8rem' }}>
                                                    <span style={{
                                                        background: `${statusColors[order.status] || '#666'}20`,
                                                        color: statusColors[order.status] || '#666',
                                                        border: `1px solid ${statusColors[order.status] || '#666'}40`,
                                                        borderRadius: 'var(--radius-sm)',
                                                        padding: '0.15rem 0.5rem',
                                                        fontFamily: 'var(--font-display)',
                                                        fontSize: '0.7rem',
                                                        textTransform: 'uppercase',
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </Section>
    );
};

export default DashboardPage;
