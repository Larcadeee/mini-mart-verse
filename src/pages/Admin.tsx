
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminAuth from "@/components/admin/AdminAuth";
import ProductManagement from "@/components/admin/ProductManagement";
import BuyerManagement from "@/components/admin/BuyerManagement";
import TransactionManagement from "@/components/admin/TransactionManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Package, Users, DollarSign } from "lucide-react";

interface TopBuyer {
  full_name: string;
  total_spent: number;
  total_orders: number;
}

interface TopProduct {
  name: string;
  category: string;
  total_sold: number;
  revenue: number;
}

const Admin = () => {
  console.log('Admin page component rendered');
  const { adminUser, loading, login } = useAdminAuth();
  const [initializing, setInitializing] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [checkingDb, setCheckingDb] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalTransactions: 0,
    totalProducts: 0,
    totalBuyers: 0
  });
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

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

  useEffect(() => {
    if (adminUser && dbConnected) {
      fetchMetrics();
      fetchTopBuyers();
      fetchTopProducts();
    }
  }, [adminUser, dbConnected]);

  const fetchMetrics = async () => {
    try {
      // Fetch total sales
      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount');
      
      const totalSales = transactions?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0;
      
      // Fetch total products
      const { data: products } = await supabase
        .from('products')
        .select('id');
      
      // Fetch total buyers
      const { data: buyers } = await supabase
        .from('buyers')
        .select('id');

      setMetrics({
        totalSales,
        totalTransactions: transactions?.length || 0,
        totalProducts: products?.length || 0,
        totalBuyers: buyers?.length || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchTopBuyers = async () => {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('full_name, total_spent, total_orders')
        .order('total_spent', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTopBuyers(data || []);
    } catch (error) {
      console.error('Error fetching top buyers:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          quantity,
          total_amount,
          products (
            name,
            category
          )
        `);

      if (error) throw error;

      // Group by product and calculate totals
      const productStats = data?.reduce((acc: any, transaction: any) => {
        const productName = transaction.products?.name;
        if (productName) {
          if (!acc[productName]) {
            acc[productName] = {
              name: productName,
              category: transaction.products.category,
              total_sold: 0,
              revenue: 0
            };
          }
          acc[productName].total_sold += transaction.quantity;
          acc[productName].revenue += Number(transaction.total_amount);
        }
        return acc;
      }, {}) || {};

      const sortedProducts = Object.values(productStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(sortedProducts as TopProduct[]);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

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

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{metrics.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From all transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalBuyers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Buyers</CardTitle>
              <CardDescription>Highest spending customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBuyers.map((buyer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{buyer.full_name}</p>
                      <p className="text-sm text-gray-500">{buyer.total_orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₱{buyer.total_spent.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {topBuyers.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No buyer data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        <span className="text-sm text-gray-500">{product.total_sold} sold</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₱{product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No product data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="buyers" className="mt-6">
            <BuyerManagement />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
