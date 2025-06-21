
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
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored admin user:', error);
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_user');
    setAdminUser(null);
  };

  const login = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('admin_user', JSON.stringify(user));
  };

  return { adminUser, loading, logout, login };
};
