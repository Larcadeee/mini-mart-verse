
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSetup = () => {
  const [sampleDataExists, setSampleDataExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkSampleData();
  }, []);

  const checkSampleData = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error checking sample data:', error);
      }

      setSampleDataExists((data?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    try {
      setCreating(true);
      
      const sampleProducts = [
        {
          name: "Chicharon",
          description: "Crispy pork skin snack, a Filipino favorite",
          price: 25.00,
          category: "Chips",
          stock: 50,
          is_featured: true,
          image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"
        },
        {
          name: "Banana Chips",
          description: "Sweet and crispy banana chips",
          price: 15.00,
          category: "Chips",
          stock: 75,
          is_featured: true,
          image_url: "https://images.unsplash.com/photo-1587132161949-b47d2ad79de8?w=400"
        },
        {
          name: "Polvoron",
          description: "Traditional Filipino shortbread confection",
          price: 35.00,
          category: "Sweets",
          stock: 30,
          is_featured: false,
          image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"
        },
        {
          name: "Dried Mangoes",
          description: "Sweet dried Philippine mangoes",
          price: 45.00,
          category: "Dried Fruits",
          stock: 40,
          is_featured: true,
          image_url: "https://images.unsplash.com/photo-1605027990121-cbae9fc09d5a?w=400"
        }
      ];

      const { error } = await supabase
        .from('products')
        .insert(sampleProducts);

      if (error) {
        throw error;
      }

      toast.success('Sample products created successfully!');
      setSampleDataExists(true);
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample products');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div>Checking system setup...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Setup</CardTitle>
        <CardDescription>
          Admin access is restricted to authorized users only (gerardherrera@gmail.com)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">✓ Admin access configured</p>
            <p className="text-sm text-blue-600 mt-1">
              Only gerardherrera@gmail.com can access admin functions
            </p>
          </div>

          {sampleDataExists ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">✓ Sample products available</p>
              <p className="text-sm text-green-600 mt-1">
                Products are loaded and ready for display
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">⚠ No products found</p>
                <p className="text-sm text-yellow-600 mt-1">
                  Create sample products to populate the store
                </p>
              </div>
              <Button 
                onClick={createSampleData} 
                disabled={creating}
                className="bg-theme-primary hover:bg-theme-primary/90"
              >
                {creating ? 'Creating Sample Products...' : 'Create Sample Products'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
