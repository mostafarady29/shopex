import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Restore user from localStorage immediately to avoid flash
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    // Validate token on mount (background check, doesn't block render)
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return;

        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Invalid');
                return res.json();
            })
            .then(data => {
                if (data.success && data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            })
            .catch(() => {
                // Token invalid — clear everything
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            });
    }, []); // Run once on mount only

    const login = useCallback(async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Login failed');
        }
        // Persist both token AND user to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (firstName, lastName, email, password, referralCode) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password, referralCode })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Registration failed');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
