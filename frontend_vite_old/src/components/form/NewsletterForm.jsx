import React, { useState } from 'react';
import Section from '../layout/Section';
import Container from '../layout/Container';

const NewsletterForm = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            alert(`Successfully subscribed to newsletter with ${email}!`);
            setEmail('');
        }
    };

    return (
        <Section className="newsletter-section">
            <Container>
                <div className="newsletter-content">
                    <h2><i className="bi bi-envelope-heart"></i> Subscribe to Our Newsletter</h2>
                    <p>Get exclusive offers and updates delivered to your inbox!</p>
                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="newsletter-input"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button type="submit" className="newsletter-btn">
                            <i className="bi bi-send"></i> Subscribe
                        </button>
                    </form>
                </div>
            </Container>
        </Section>
    );
};

export default NewsletterForm;
