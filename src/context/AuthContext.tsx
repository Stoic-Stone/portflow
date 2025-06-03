import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  full_name?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userRow } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (userRow) {
          setUser({
            id: userRow.id,
            email: userRow.email,
            first_name: userRow.full_name,
            last_name: '',
            role: userRow.role,
          });
        }
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message || 'Authentication failed');
    }
    // Fetch user from 'users' table using 'id'
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (userError || !userRow) {
      console.error('User fetch error:', userError, 'id:', data.user.id);
      throw new Error(userError?.message || 'User not found');
    }
    setUser({
      id: userRow.id,
      email: userRow.email,
      first_name: userRow.full_name,
      last_name: '',
      role: userRow.role,
    });
  };

  const register = async (email: string, password: string, fullName: string, role: string) => {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Registration failed');
    }

    // Then, create the user profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
        },
      ]);

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.signOut();
      throw new Error(profileError.message || 'Failed to create user profile');
    }

    // Set the user in the context
    setUser({
      id: authData.user.id,
      email,
      first_name: fullName,
      last_name: '',
      role,
    });
  };

  const logout = () => {
    setUser(null);
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 