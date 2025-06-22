
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminAuth from "@/components/admin/AdminAuth";
import AdminSetup from "@/components/admin/AdminSetup";
import ProductManagement from "@/components/admin/ProductManagement";
import BuyerManagement from "@/components/admin/BuyerManagement";
import TransactionManagement from "@/components/admin/TransactionManagement";

const Admin = () => {
  console.log('Admin page component rendered');
  const { adminUser, loading, login } = useAdminAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('Admin useEffect - loading:', loading, 'adminUser:', adminUser);
    // Small delay to ensure proper initialization
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, adminUser]);

  console.log('Admin render state - loading:', loading, 'initializing:', initializing, 'adminUser:', !!adminUser);

  // Show loading only during initial auth check
  if (loading || initializing) {
    console.log('Admin showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
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
