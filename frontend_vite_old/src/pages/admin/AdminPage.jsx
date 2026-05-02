import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Section from '../../components/layout/Section';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';

const AdminPage = () => {
    const { user, token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) { setLoading(false); return; }

        Promise.all([
            fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
        ])
            .then(([statsData, usersData, ordersData]) => {
                if (statsData.success) setStats(statsData.stats);
                if (usersData.success) setUsers(usersData.users);
                if (ordersData.success) setOrders(ordersData.orders);
            })
            .catch(err => console.error('Admin fetch error:', err))
            .finally(() => setLoading(false));
    }, [token]);

    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'moderator')) {
        return (
            <Section>
                <Container>
                    <div className="bento-box" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto var(--space-3)',
                        }}>
                            <i className="bi bi-shield-x" style={{ fontSize: '2rem', color: '#ef4444' }}></i>
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>Access Denied</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                            Admin privileges required to access this panel.
                        </p>
                        <Link to="/login"><Button variant="primary">Login as Admin</Button></Link>
                    </div>
                </Container>
            </Section>
        );
    }

    const statusColors = {
        pending: '#F59E0B', processing: '#3B82F6', completed: '#10B981', cancelled: '#EF4444',
    };
    const roleColors = {
        customer: '#6B7280', admin: '#EF4444', moderator: '#F59E0B',
    };

    const tabs = [
        { id: 'overview', icon: 'bi-speedometer2', label: 'Overview' },
        { id: 'users', icon: 'bi-people', label: 'Users' },
        { id: 'orders', icon: 'bi-receipt', label: 'Orders' },
    ];

    return (
        <Section>
            <Container>
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="bento-label" style={{ marginBottom: 'var(--space-2)' }}>
                        <i className="bi bi-gear"></i> ADMIN CONTROL CENTER
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}>
                        Admin <span className="text-accent">Panel</span>
                    </h1>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-4)',
                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                    padding: '4px', border: '1px solid var(--border-color)',
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, padding: '0.6rem 1rem',
                                background: activeTab === tab.id ? 'var(--accent-color)' : 'transparent',
                                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                                border: 'none', borderRadius: 'var(--radius-sm)',
                                fontFamily: 'var(--font-display)', fontSize: '0.8rem',
                                cursor: 'pointer', transition: 'all 200ms ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            }}
                        >
                            <i className={`bi ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-5)', color: 'var(--accent-color)', fontFamily: 'var(--font-display)' }}>
                        <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: '1.5rem' }}></i>
                        <p style={{ marginTop: 'var(--space-2)' }}>Loading admin data...</p>
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && stats && (
                            <div className="bento-grid animate-stagger">
                                {[
                                    { icon: 'bi-currency-dollar', label: 'Total Revenue', value: `$${stats.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: '#10B981' },
                                    { icon: 'bi-bag-check', label: 'Total Orders', value: stats.totalOrders, color: '#3B82F6' },
                                    { icon: 'bi-box-seam', label: 'Products', value: stats.totalProducts, color: '#8B5CF6' },
                                    { icon: 'bi-people', label: 'Users', value: stats.totalUsers, color: '#F59E0B' },
                                    { icon: 'bi-link-45deg', label: 'Referrals', value: stats.totalReferrals, color: '#EC4899' },
                                    { icon: 'bi-wallet2', label: 'Commissions', value: `$${stats.totalCommissions?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: '#06B6D4' },
                                ].map((stat, i) => (
                                    <div key={i} className="bento-col-12 bento-col-4 bento-box" style={{
                                        position: 'relative', overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: -10, right: -10,
                                            width: 60, height: 60, borderRadius: '50%',
                                            background: `${stat.color}10`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <i className={`bi ${stat.icon}`} style={{ fontSize: '1.5rem', color: stat.color, opacity: 0.4 }}></i>
                                        </div>
                                        <div className="bento-label"><i className={`bi ${stat.icon}`} style={{ color: stat.color }}></i> {stat.label}</div>
                                        <div className="bento-value" style={{ color: stat.color, marginTop: 'var(--space-2)' }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="bento-box">
                                <div className="bento-label" style={{ marginBottom: 'var(--space-3)' }}>
                                    <i className="bi bi-people"></i> ALL USERS ({users.length})
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                {['Name', 'Email', 'Role', 'Joined'].map(h => (
                                                    <th key={h} style={{
                                                        fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                                                        color: 'var(--text-muted)', textTransform: 'uppercase',
                                                        letterSpacing: '0.08em', padding: '0.6rem 0.8rem', textAlign: 'left',
                                                    }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{
                                                    borderBottom: '1px solid var(--border-color)',
                                                    transition: 'background 150ms',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '0.7rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            background: 'var(--accent-color)', color: '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                                                        }}>
                                                            {u.firstName?.[0]}{u.lastName?.[0]}
                                                        </div>
                                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                                                            {u.firstName} {u.lastName}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                                                    <td style={{ padding: '0.7rem 0.8rem' }}>
                                                        <span style={{
                                                            background: `${roleColors[u.role] || '#666'}20`,
                                                            color: roleColors[u.role] || '#666',
                                                            border: `1px solid ${roleColors[u.role] || '#666'}40`,
                                                            borderRadius: 'var(--radius-sm)',
                                                            padding: '0.15rem 0.5rem',
                                                            fontFamily: 'var(--font-display)', fontSize: '0.7rem', textTransform: 'uppercase',
                                                        }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="bento-box">
                                <div className="bento-label" style={{ marginBottom: 'var(--space-3)' }}>
                                    <i className="bi bi-receipt"></i> ALL ORDERS ({orders.length})
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                                                    <th key={h} style={{
                                                        fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                                                        color: 'var(--text-muted)', textTransform: 'uppercase',
                                                        letterSpacing: '0.08em', padding: '0.6rem 0.8rem', textAlign: 'left',
                                                    }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} style={{
                                                    borderBottom: '1px solid var(--border-color)',
                                                    transition: 'background 150ms',
                                                }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '0.7rem 0.8rem', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                                                        {order.orderId}
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {order.user?.firstName} {order.user?.lastName}
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.8rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {order.items?.length || 0}
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                                                        ${order.total?.toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: '0.7rem 0.8rem' }}>
                                                        <span style={{
                                                            background: `${statusColors[order.status] || '#666'}20`,
                                                            color: statusColors[order.status] || '#666',
                                                            border: `1px solid ${statusColors[order.status] || '#666'}40`,
                                                            borderRadius: 'var(--radius-sm)',
                                                            padding: '0.15rem 0.5rem',
                                                            fontFamily: 'var(--font-display)', fontSize: '0.7rem', textTransform: 'uppercase',
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
                            </div>
                        )}
                    </>
                )}
            </Container>
        </Section>
    );
};

export default AdminPage;
