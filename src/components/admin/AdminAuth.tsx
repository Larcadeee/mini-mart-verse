
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminAuthProps {
  onLogin: (user: any) => void;
}

const AdminAuth = ({ onLogin }: AdminAuthProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Admin login attempt for:', formData.email);
      
      // Only allow specific email
      if (formData.email !== 'gerardherrera@gmail.com') {
        toast.error('Access denied. Only authorized administrators can login.');
        setLoading(false);
        return;
      }

      // For the authorized admin, create a simple auth object
      if (formData.email === 'gerardherrera@gmail.com' && formData.password === 'admin123') {
        const adminUser = {
          id: 'admin-001',
          email: 'gerardherrera@gmail.com',
          full_name: 'Gerard Herrera',
          role: 'admin',
          is_active: true
        };

        console.log('Admin login successful:', adminUser);
        toast.success('Login successful! Redirecting to admin dashboard...');
        onLogin(adminUser);
        
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
        <CardDescription>
          Access restricted to authorized administrators only
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your admin email"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
          <p className="text-red-800 font-medium">Restricted Access</p>
          <p className="text-red-600 text-xs mt-1">
            Only gerardherrera@gmail.com can access admin functions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuth;
