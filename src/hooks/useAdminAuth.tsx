
import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAdminAuth effect running');
    const storedUser = localStorage.getItem('admin_user');
    console.log('Stored user from localStorage:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user:', parsedUser);
        setAdminUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored admin user:', error);
        localStorage.removeItem('admin_user');
      }
    } else {
      console.log('No stored user found');
    }
    
    setLoading(false);
    console.log('useAdminAuth loading set to false');
  }, []);

  const logout = () => {
    console.log('Admin logout called');
    localStorage.removeItem('admin_user');
    setAdminUser(null);
  };

  const login = (user: AdminUser) => {
    console.log('Admin login called with user:', user);
    setAdminUser(user);
    localStorage.setItem('admin_user', JSON.stringify(user));
  };

  console.log('useAdminAuth returning - adminUser:', !!adminUser, 'loading:', loading);
  return { adminUser, loading, logout, login };
};
