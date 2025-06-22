
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminAuth from "@/components/admin/AdminAuth";
import AdminSetup from "@/components/admin/AdminSetup";
import ProductManagement from "@/components/admin/ProductManagement";
import BuyerManagement from "@/components/admin/BuyerManagement";
import TransactionManagement from "@/components/admin/TransactionManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
  console.log('Admin page component rendered');
  const { adminUser, loading, login } = useAdminAuth();
  const [initializing, setInitializing] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [checkingDb, setCheckingDb] = useState(true);

  // Check database connection on mount
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        console.log('Checking database connection...');
        const { data, error } = await supabase
          .from('admin_users')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Database connection error:', error);
          toast.error('Database connection failed');
          setDbConnected(false);
        } else {
          console.log('Database connection successful');
          setDbConnected(true);
        }
      } catch (error) {
        console.error('Database connection error:', error);
        setDbConnected(false);
        toast.error('Database connection failed');
      } finally {
        setCheckingDb(false);
      }
    };

    checkDatabaseConnection();
  }, []);

  useEffect(() => {
    console.log('Admin useEffect - loading:', loading, 'adminUser:', adminUser, 'dbConnected:', dbConnected);
    
    // Only initialize after database connection check is complete
    if (!checkingDb) {
      const timer = setTimeout(() => {
        setInitializing(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, adminUser, checkingDb, dbConnected]);

  console.log('Admin render state - loading:', loading, 'initializing:', initializing, 'adminUser:', !!adminUser, 'dbConnected:', dbConnected, 'checkingDb:', checkingDb);

  // Show loading during initial checks
  if (loading || initializing || checkingDb) {
    console.log('Admin showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingDb ? 'Checking database connection...' : 'Loading admin panel...'}
          </p>
        </div>
      </div>
    );
  }

  // Show database connection error
  if (!dbConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Database Connection Error</CardTitle>
            <CardDescription>
              Unable to connect to the database. Please check your connection and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Retry Connection
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login if not authenticated
  if (!adminUser) {
    console.log('Admin showing login form');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AdminAuth onLogin={login} />
        </div>
      </div>
    );
  }

  console.log('Admin showing main dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {adminUser.full_name}</p>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Database Connected
          </div>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="mt-6">
            <AdminSetup />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="buyers" className="mt-6">
            <BuyerManagement />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionManagement />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Analytics and reporting tools</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Reports functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
