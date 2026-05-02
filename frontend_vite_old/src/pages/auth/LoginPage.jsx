import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import Input from '../../components/form/Input';
import Label from '../../components/form/Label';
import Button from '../../components/ui/Button';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setError('');
        setSubmitting(true);

        try {
            const referralCode = localStorage.getItem('affiliate_ref');

            if (isRegistering) {
                if (!firstName) {
                    setError('Please enter your first name');
                    setSubmitting(false);
                    return;
                }
                await register(firstName, lastName, email, password, referralCode);
            } else {
                await login(email, password);
            }

            // Clear stored referral after successful auth
            localStorage.removeItem('affiliate_ref');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Section className="login-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <Container>
                <div className="bento-grid">

                    <div className="bento-col-12 bento-col-6 bento-box">
                        <div className="bento-label">{isRegistering ? 'USER REGISTRATION // SYSTEM ID_CREATION' : 'AUTHENTICATION // SECURE ACCESS'}</div>
                        <h1 className="mb-4">{isRegistering ? 'CREATE ACCOUNT' : 'SYSTEM LOGIN'}</h1>
                        <p className="mb-5" style={{ color: 'var(--text-secondary)' }}>
                            {isRegistering
                                ? 'Join SaaS Hub to access premium operational tools.'
                                : 'Authenticate to access your dashboard and operational tools.'}
                        </p>

                        {error && (
                            <div style={{
                                background: 'rgba(186, 26, 26, 0.1)',
                                border: '1px solid rgba(186, 26, 26, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-2) var(--space-3)',
                                marginBottom: 'var(--space-3)',
                                color: '#ef4444',
                                fontFamily: 'var(--font-display)',
                                fontSize: '0.85rem'
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4" style={{ flexDirection: 'column' }}>
                            {isRegistering && (
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <div style={{ flex: 1 }}>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="operator@saashub.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <div className="d-flex justify-between align-center mb-2">
                                    <Label htmlFor="password" style={{ margin: 0 }}>Password</Label>
                                    {!isRegistering && (
                                        <Link to="#" className="text-muted" style={{ fontSize: '0.875rem' }}>Forgot password?</Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mt-4">
                                <Button variant="primary" type="submit" style={{ width: '100%', opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                                    {submitting
                                        ? 'PROCESSING...'
                                        : isRegistering ? 'REGISTER' : 'AUTHENTICATE'}
                                </Button>
                            </div>

                            {/* Quick demo login hint */}
                            {!isRegistering && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                                    Demo: admin@saashub.com / pass123
                                </p>
                            )}
                        </form>

                        <div className="mt-5 text-center text-muted" style={{ borderTop: 'var(--border-width) solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
                            {isRegistering ? 'Already have an account?' : 'New to the system?'}
                            {' '}
                            <button
                                type="button"
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase' }}
                            >
                                {isRegistering ? 'Login Instead' : 'Create Account'}
                            </button>
                        </div>
                    </div>

                    <div className="bento-col-12 bento-col-6 bento-box" style={{ background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'center' }}>
                        <h2 className="mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                            STRICTLY<br />
                            PROFESSIONAL<br />
                            <span className="text-accent">CURATION.</span>
                        </h2>
                        <p style={{ fontSize: '1.25rem', maxWidth: '40ch', color: 'var(--text-secondary)' }}>
                            Uncompromising quality for operators and teams who demand the highest tier of functionality.
                        </p>
                    </div>

                </div>
            </Container>
        </Section>
    );
};

export default LoginPage;
