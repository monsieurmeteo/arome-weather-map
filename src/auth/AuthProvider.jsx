import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check for persisted DEMO user
        const demoUser = localStorage.getItem('minisite_demo_user');
        if (demoUser) {
            setUser(JSON.parse(demoUser));
            setLoading(false);
            return;
        }

        // 2. Check active Supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 3. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Only update if we are NOT in demo mode (to avoid conflict)
            if (!localStorage.getItem('minisite_demo_user')) {
                setUser(session?.user ?? null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Login function wrapper
    const login = async (email, password) => {
        // DEMO BYPASS: Check hardcoded credentials here to set state properly
        if ((email.toLowerCase() === 'douai' && password === 'Meteoclimatpro') ||
            (email.toLowerCase() === 'contact@douai.fr' && password === 'Meteoclimatpro')) {
            const mockUser = { id: 'demo', email: 'contact@douai.fr' };

            // PERSIST DEMO USER
            localStorage.setItem('minisite_demo_user', JSON.stringify(mockUser));

            setUser(mockUser);
            setLoading(false);
            return { data: { user: mockUser }, error: null };
        }

        return supabase.auth.signInWithPassword({ email, password });
    };

    // Logout function wrapper
    const logout = async () => {
        // CLEAR DEMO USER
        localStorage.removeItem('minisite_demo_user');

        setUser(null);
        return supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
