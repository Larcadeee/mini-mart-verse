
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminAuth from "@/components/admin/AdminAuth";
import ProductManagement from "@/components/admin/ProductManagement";
import BuyerManagement from "@/components/admin/BuyerManagement";
import TransactionManagement from "@/components/admin/TransactionManagement";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalSales: number;
  totalTransactions: number;
  totalProducts: number;
  totalBuyers: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

interface TopBuyer {
  id: string;
  name: string;
  orders: number;
  total: number;
}

interface UserProfile {
  full_name: string;
  role: string;
}

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalTransactions: 0,
    totalProducts: 0,
    totalBuyers: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchDashboardData();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
      
      // If user is not admin, redirect to home
      if (data.role !== 'admin') {
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('dashboard_metrics')
        .select('*');

      if (metricsError) throw metricsError;

      const statsData = {
        totalSales: metrics?.find(m => m.metric_name === 'total_sales')?.metric_value || 0,
        totalTransactions: metrics?.find(m => m.metric_name === 'total_transactions')?.metric_value || 0,
        totalProducts: metrics?.find(m => m.metric_name === 'total_products')?.metric_value || 0,
        totalBuyers: metrics?.find(m => m.metric_name === 'total_buyers')?.metric_value || 0
      };

      setStats(statsData);

      // Fetch top products
      const { data: productsData, error: productsError } = await supabase
        .from('transactions')
        .select(`
          product_id,
          quantity,
          total_amount,
          products (
            id,
            name
          )
        `);

      if (productsError) throw productsError;

      const productSales = productsData?.reduce((acc: any, transaction) => {
        const productId = transaction.product_id;
        const productName = transaction.products?.name || 'Unknown';
        
        if (!acc[productId]) {
          acc[productId] = {
            id: productId,
            name: productName,
            sales: 0,
            revenue: 0
          };
        }
        
        acc[productId].sales += transaction.quantity;
        acc[productId].revenue += Number(transaction.total_amount);
        
        return acc;
      }, {});

      const sortedProducts = Object.values(productSales || {})
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 4);

      setTopProducts(sortedProducts as TopProduct[]);

      // Fetch top buyers
      const { data: buyersData, error: buyersError } = await supabase
        .from('buyers')
        .select('*')
        .order('total_spent', { ascending: false })
        .limit(4);

      if (buyersError) throw buyersError;

      const topBuyersData = buyersData?.map(buyer => ({
        id: buyer.id,
        name: buyer.full_name,
        orders: buyer.total_orders,
        total: Number(buyer.total_spent)
      })) || [];

      setTopBuyers(topBuyersData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Check if user is authenticated and has admin role
  if (!user || !userProfile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (userProfile.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-theme-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme-primary">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome, {userProfile.full_name || user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Back to Store</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="buyers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Buyers</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Transactions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-theme-primary to-orange-400 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{Number(stats.totalSales).toLocaleString()}</div>
                  <p className="text-xs text-orange-200">From all transactions</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                  <p className="text-xs text-green-200">Total completed orders</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-orange-200">Available in inventory</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Buyers</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBuyers}</div>
                  <p className="text-xs text-purple-200">Registered customers</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Products and Buyers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Top Products</span>
                  </CardTitle>
                  <CardDescription>Best selling items by revenue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₱{product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-theme-primary" />
                    <span>Top Buyers</span>
                  </CardTitle>
                  <CardDescription>Highest spending customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topBuyers.map((buyer, index) => (
                    <div key={buyer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{buyer.name}</p>
                          <p className="text-sm text-gray-600">{buyer.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-theme-primary">₱{buyer.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="buyers" className="space-y-6">
            <BuyerManagement />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
