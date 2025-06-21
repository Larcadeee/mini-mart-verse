
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import bcrypt from 'bcryptjs';

const AdminSetup = () => {
  const [defaultAdminExists, setDefaultAdminExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@minimart.com',
    password: 'admin123',
    fullName: 'Default Admin'
  });

  useEffect(() => {
    checkDefaultAdmin();
  }, []);

  const checkDefaultAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', 'admin@minimart.com')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setDefaultAdminExists(!!data);
    } catch (error) {
      console.error('Error checking default admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAdmin = async () => {
    try {
      setCreating(true);
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(formData.password, saltRounds);

      // Insert default admin user
      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: formData.email,
          password_hash: hashedPassword,
          full_name: formData.fullName,
          role: 'admin',
          is_active: true
        });

      if (error) {
        throw error;
      }

      toast.success('Default admin user created successfully!');
      setDefaultAdminExists(true);
    } catch (error) {
      console.error('Error creating default admin:', error);
      toast.error('Failed to create default admin user');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div>Checking admin setup...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Setup</CardTitle>
        <CardDescription>
          {defaultAdminExists 
            ? 'Default admin user is configured' 
            : 'Create a default admin user to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {defaultAdminExists ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">✓ Default admin user exists</p>
              <p className="text-sm text-green-600 mt-1">
                You can log in with: admin@minimart.com
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <Button 
              onClick={createDefaultAdmin} 
              disabled={creating}
              className="bg-theme-primary hover:bg-theme-primary/90"
            >
              {creating ? 'Creating...' : 'Create Default Admin'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
