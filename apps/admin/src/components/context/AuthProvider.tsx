/* eslint-disable react-refresh/only-export-components */
import { supabase } from '@/lib/supabaseClient';
import React, { useContext, useEffect, useState } from 'react'
import { createContext } from 'react';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextType = {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

type IProps = {
    children: React.ReactElement
}


export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};


const AuthProvider: React.FC<IProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {

                setIsAuthenticated(true);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);


    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const userId = data.user?.id;
        if (!userId) throw new Error("Authentication failed: no user ID returned.");

        // Fetch user from Users table
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('isAdmin')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        if (!userData?.isAdmin) throw new Error("Forbidden Access");
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };


    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
    )
}

export default AuthProvider