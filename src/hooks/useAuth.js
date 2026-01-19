'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/admin/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('adminToken');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [])

  const login = async (email, password) => {
    try {
      // console.log('📧 Requesting access for:',{ email, password});

      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });



      // console.log('📡 Login response status:', response.status);

      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Login failed:', errorData.error);
        return { success: false, error: errorData.error };
      }

      const data = await response.json();

      // console.log('✅ Login successful, token received');
      // console.log('📧 Request access response:', data);
      
      localStorage.setItem('adminToken', data.token);
      setUser(data.user);
      return { success: true };
      
    } catch (error) {
      console.error('🚨 Login request failed:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};