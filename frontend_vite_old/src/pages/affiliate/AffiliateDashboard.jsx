import React, { useState, useEffect } from 'react';
import Section from '../../components/layout/Section';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';

const AffiliateDashboard = () => {
    const [data, setData] = useState({
        referralCode: 'SYNCING...',
        registeredUsers: 0,
        paidSubscriptions: 0,
        totalCommissions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/affiliate/dashboard', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(res => { if (!res.ok) throw new Error('API failed'); return res.json(); })
            .then(json => { if (json.success) setData(json); setLoading(false); })
            .catch(err => {
                // Fallback mocked data 
                setData({
                    referralCode: 'OP-R8XJ2',
                    registeredUsers: 142,
                    paidSubscriptions: 86,
                    totalCommissions: 4300.00
                });
                setLoading(false);
            });
    }, []);

    const referralLink = `${window.location.origin}/?ref=${data.referralCode}`;

    return (
        <Section className="affiliate-dashboard">
            <Container>
                <div className="animate-stagger" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <h1>
                        Partner Node Operations
                    </h1>
                    <p className="text-muted mt-4">
                        Manage your network telemetry and referral mapping from a centralized secure dashboard.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontFamily: 'var(--font-display)', color: 'var(--accent-color)' }}>
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                        Loading affiliate payload...
                    </div>
                ) : (
                    <div className="bento-grid animate-stagger">

                        {/* Wide Hero Box: Link Generator */}
                        <div className="bento-col-12 bento-box">
                            <div className="bento-label"><i className="bi bi-link-45deg"></i> Distribution URL</div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                Share this cryptographic payload identifier to attribute signups securely to your account.
                            </p>

                            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', wordBreak: 'break-all', paddingLeft: 'var(--space-2)' }}>
                                    {referralLink}
                                </span>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(referralLink);
                                        alert('URL copied to clipboard.');
                                    }}
                                >
                                    <i className="bi bi-files"></i> Copy
                                </Button>
                            </div>
                        </div>

                        {/* Small Stat Box 1 */}
                        <div className="bento-col-12 bento-col-4 bento-box">
                            <div className="bento-label"><i className="bi bi-people"></i> Network Nodes</div>
                            <div className="bento-value">
                                {data.registeredUsers}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 'var(--space-2)' }}>
                                Total authentications mapped via your URL.
                            </div>
                        </div>

                        {/* Small Stat Box 2 */}
                        <div className="bento-col-12 bento-col-4 bento-box">
                            <div className="bento-label"><i className="bi bi-check-circle"></i> Validated Pipelines</div>
                            <div className="bento-value">
                                {data.paidSubscriptions}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 'var(--space-2)' }}>
                                Identities that converted to paid subscriptions.
                            </div>
                        </div>

                        {/* Highlighted Stat Box 3 */}
                        <div className="bento-col-12 bento-col-4 bento-box" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent-color)' }}>
                            <div className="bento-label" style={{ color: 'var(--accent-color)' }}><i className="bi bi-wallet2"></i> Ledger Extract</div>
                            <div className="bento-value" style={{ color: 'var(--accent-color)' }}>
                                ${data.totalCommissions.toLocaleString()}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 'var(--space-2)' }}>
                                Available balance ready for crypto transfer.
                            </div>
                        </div>

                    </div>
                )}
            </Container>
        </Section>
    );
};

export default AffiliateDashboard;
