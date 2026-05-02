import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';

const footerLinks = {
    Shop: [
        { label: 'All Products', to: '/products' },
        { label: 'New Arrivals', to: '/products?filter=new' },
        { label: 'Best Sellers', to: '/products?filter=bestsellers' },
        { label: 'On Sale', to: '/products?filter=sale' },
    ],
    Company: [
        { label: 'About Us', to: '/about' },
        { label: 'Contact', to: '/contact' },
        { label: 'Affiliate Program', to: '/affiliate/dashboard' },
    ],
    Legal: [
        { label: 'Privacy Policy', to: '#' },
        { label: 'Terms of Service', to: '#' },
    ],
};

const socialLinks = [
    { href: '#', icon: 'bi-twitter-x', label: 'Twitter / X' },
    { href: '#', icon: 'bi-instagram', label: 'Instagram' },
    { href: '#', icon: 'bi-github', label: 'GitHub' },
    { href: '#', icon: 'bi-discord', label: 'Discord' },
];

const Footer = () => {
    return (
        <footer
            style={{
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                paddingTop: 'var(--space-5)',
                paddingBottom: 'var(--space-4)',
            }}
        >
            <Container>
                {/* Main grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 'var(--space-4)',
                        paddingBottom: 'var(--space-4)',
                        borderBottom: '1px solid var(--border-color)',
                    }}
                >
                    {/* Brand */}
                    <div>
                        <Link
                            to="/"
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                marginBottom: 'var(--space-2)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            <span style={{ color: 'var(--accent-color)' }}>&gt;</span>
                            SaaS<span style={{ color: 'var(--accent-color)' }}>Hub</span>
                        </Link>
                        <p
                            style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                maxWidth: '22ch',
                            }}
                        >
                            Essential curation for the modern operator.
                        </p>
                        {/* Social Icons */}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                            {socialLinks.map(({ href, icon, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    style={{
                                        color: 'var(--text-muted)',
                                        fontSize: '1rem',
                                        width: 32,
                                        height: 32,
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'color 150ms, border-color 150ms',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                >
                                    <i className={`bi ${icon}`} aria-hidden="true"></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link groups */}
                    {Object.entries(footerLinks).map(([heading, links]) => (
                        <div key={heading}>
                            <h4
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: 'var(--space-3)',
                                    fontWeight: 600,
                                }}
                            >
                                {heading}
                            </h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                {links.map(({ label, to }) => (
                                    <li key={label}>
                                        <Link
                                            to={to}
                                            style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.875rem',
                                                transition: 'color 150ms',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        paddingTop: 'var(--space-3)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 'var(--space-2)',
                    }}
                >
                    <p
                        style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontFamily: 'var(--font-display)',
                        }}
                    >
                        © 2026 SaaS Hub. All rights reserved.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Built with <span style={{ color: 'var(--accent-color)' }}>♦</span> precision.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
