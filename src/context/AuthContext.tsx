import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';
import { router } from 'expo-router';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

interface Ensemble {
    id: number;
    name: string;
    ensemble_id: number;
    ensemble_name: string;
    section?: string;
    part?: string;
}

interface AuthContextType {
    user: User | null;
    ensembles: Ensemble[];
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (data: any) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [ensembles, setEnsembles] = useState<Ensemble[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored session
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const storedUser = await SecureStore.getItemAsync('user_session');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEnsembles = async (email: string) => {
        try {
            const response = await client.get(`/api/students/me?email=${encodeURIComponent(email)}`);
            setEnsembles(response.data || []);
        } catch (error) {
            console.error('Failed to fetch ensembles:', error);
            setEnsembles([]);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await client.post('/auth/login', { email, password });
            const userData = response.data;

            // Store session
            await SecureStore.setItemAsync('user_session', JSON.stringify(userData));
            setUser(userData);

            // Fetch student's ensembles
            await fetchEnsembles(userData.email);

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    };

    const signUp = async (data: any) => {
        try {
            const response = await client.post('/auth/signup', data);
            const userData = response.data;

            // Store session
            await SecureStore.setItemAsync('user_session', JSON.stringify(userData));
            setUser(userData);

            // Fetch student's ensembles
            await fetchEnsembles(userData.email);

            router.replace('/(tabs)');
        } catch (error) {
            console.error('Sign up failed:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('user_session');
            setUser(null);
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, ensembles, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
