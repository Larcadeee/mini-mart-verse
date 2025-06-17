
import { useState } from 'react';
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
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

const mockData = {
  stats: {
    totalSales: 15420.50,
    totalTransactions: 342,
    totalProducts: 89,
    totalBuyers: 156
  },
  topProducts: [
    { id: 1, name: "Premium Coffee Beans", sales: 156, revenue: 2025.44 },
    { id: 2, name: "Organic Snack Mix", sales: 134, revenue: 1137.66 },
    { id: 3, name: "Fresh Fruit Bowl", sales: 98, revenue: 1567.02 },
    { id: 4, name: "Artisan Chocolate", sales: 87, revenue: 869.13 }
  ],
  topBuyers: [
    { id: 1, name: "John Smith", orders: 23, total: 456.78 },
    { id: 2, name: "Sarah Johnson", orders: 19, total: 389.45 },
    { id: 3, name: "Mike Wilson", orders: 15, total: 298.90 },
    { id: 4, name: "Emma Davis", orders: 12, total: 234.56 }
  ],
  recentTransactions: [
    { id: 1, buyer: "John Smith", product: "Premium Coffee Beans", amount: 12.99, status: "Verified", time: "2 hours ago" },
    { id: 2, buyer: "Sarah Johnson", product: "Organic Snack Mix", amount: 8.49, status: "Pending", time: "3 hours ago" },
    { id: 3, buyer: "Mike Wilson", product: "Fresh Fruit Bowl", amount: 15.99, status: "Verified", time: "5 hours ago" },
    { id: 4, buyer: "Emma Davis", product: "Artisan Chocolate", amount: 9.99, status: "Verified", time: "6 hours ago" }
  ]
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">MiniMart Online Control Panel</p>
              </div>
            </div>
            
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Back to Store</span>
              </Button>
            </Link>
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
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockData.stats.totalSales.toLocaleString()}</div>
                  <p className="text-xs text-blue-200">+12.3% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.stats.totalTransactions}</div>
                  <p className="text-xs text-green-200">+8.7% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.stats.totalProducts}</div>
                  <p className="text-xs text-orange-200">+5 new this month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Buyers</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.stats.totalBuyers}</div>
                  <p className="text-xs text-purple-200">+15 new this month</p>
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
                  <CardDescription>Best selling items this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockData.topProducts.map((product, index) => (
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
                        <p className="font-bold text-green-600">${product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Top Buyers</span>
                  </CardTitle>
                  <CardDescription>Most active customers this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockData.topBuyers.map((buyer, index) => (
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
                        <p className="font-bold text-blue-600">${buyer.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Product Management</h3>
                  <p className="text-gray-600 mb-4">Manage your inventory, add new products, and track stock levels.</p>
                  <Button variant="outline">View All Products</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Buyer Management</h2>
              <Button className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Buyer
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Buyer Management</h3>
                  <p className="text-gray-600 mb-4">View and manage customer accounts, order history, and preferences.</p>
                  <Button variant="outline">View All Buyers</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent orders and their verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{transaction.buyer}</p>
                          <p className="text-sm text-gray-600">{transaction.product}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={transaction.status === 'Verified' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                        <p className="font-bold">${transaction.amount}</p>
                        <p className="text-sm text-gray-500">{transaction.time}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
