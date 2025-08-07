/* eslint-disable react-refresh/only-export-components */
import { supabase } from '@/lib/supabaseClient';
import React, { useContext, useEffect, useState } from 'react'
import { createContext } from 'react';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextType = {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    userData: UserData | null;
    updateNewUserStatus: () => void;
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

type UserData = {
    authId: string,
    isAdmin: boolean,
    isNewUser: boolean,
    userId: string,
    firstName: string
}


const AuthProvider: React.FC<IProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null)



    // Function to fetch user data from 'Users' table
    const fetchUserData = async (email: string) => {
        const { data, error } = await supabase
            .from('Users')
            .select('id, firstName, isAdmin, authId, isNewUser')
            .eq('email', email)
            .single();

        if (error) {
            toast.error("Error fetching user data.");
            return;
        }

        if (data?.isAdmin) {
            toast.error("Forbidden Access: Admins cannot login from here.");
            throw new Error("Forbidden Access: Admins cannot login from here.");
        }

        setUserData({
            authId: data.authId ?? '',
            isAdmin: data.isAdmin ?? false,
            isNewUser: data.isNewUser ?? false,
            userId: data.id ?? '',
            firstName: data.firstName ?? ''
        });
    };

    useEffect(() => {
        const email = localStorage.getItem('zielClient_email');
        if (isAuthenticated && email) {
            fetchUserData(email);
        }
    }, [isAuthenticated]);

    const handleLoggedInState = (val: boolean) => {
        setIsAuthenticated(val)
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleLoggedInState(!!session)
        })
    }, [])

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user?.email) {
                // await fetchUserData(session.user.email);
                handleLoggedInState(true);
            } else {
                handleLoggedInState(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        // Proceed with signInWithPassword since it's a non-admin
        localStorage.setItem('zielClient_email', email)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const userId = data.user?.id;
        if (!userId) throw new Error("Authentication failed: no user ID returned.");
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('zielClient_email')
        handleLoggedInState(false);
    };

    const updateNewUserStatus = () => {
        setUserData(prevState => prevState ? { ...prevState, isNewUser: false } : prevState);
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                userData,
                updateNewUserStatus
            }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider