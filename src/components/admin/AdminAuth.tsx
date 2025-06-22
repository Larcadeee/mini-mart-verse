
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminAuthProps {
  onLogin: (user: any) => void;
}

const AdminAuth = ({ onLogin }: AdminAuthProps) => {
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
      
      // Query admin_users table
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', formData.email)
        .eq('password_hash', formData.password) // For demo - in production use proper hashing
        .eq('is_active', true)
        .single();

      if (error || !adminUser) {
        console.error('Admin login error:', error);
        toast.error('Invalid email or password');
        return;
      }

      console.log('Admin login successful:', adminUser);
      toast.success('Login successful!');
      onLogin(adminUser);
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
          Enter your admin credentials to access the dashboard
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
              placeholder="admin@minimart.com"
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
            className="w-full bg-theme-primary hover:bg-theme-primary/90"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p>Default credentials:</p>
          <p>Email: admin@minimart.com</p>
          <p>Password: admin123</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuth;
