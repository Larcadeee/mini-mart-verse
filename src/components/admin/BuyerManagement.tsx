
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Mail, Ban, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItem {
  id: string;
  user_id: string;
  quantity: number;
  created_at: string;
  products: {
    name: string;
    price: number;
  };
}

interface BuyerStats {
  user_id: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const BuyerManagement = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyerStats, setBuyerStats] = useState<BuyerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerStats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBuyerData();
  }, []);

  const fetchBuyerData = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCartItems(data || []);
      
      // Process buyer statistics
      const buyerMap = new Map<string, BuyerStats>();
      
      data?.forEach((item) => {
        const userId = item.user_id;
        const orderValue = item.products.price * item.quantity;
        
        if (buyerMap.has(userId)) {
          const existing = buyerMap.get(userId)!;
          existing.totalOrders += 1;
          existing.totalSpent += orderValue;
          if (new Date(item.created_at) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = item.created_at;
          }
        } else {
          buyerMap.set(userId, {
            user_id: userId,
            totalOrders: 1,
            totalSpent: orderValue,
            lastOrderDate: item.created_at
          });
        }
      });
      
      setBuyerStats(Array.from(buyerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));
    } catch (error) {
      console.error('Error fetching buyer data:', error);
      toast.error('Failed to load buyer data');
    } finally {
      setLoading(false);
    }
  };

  const viewBuyer = (buyer: BuyerStats) => {
    setSelectedBuyer(buyer);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBuyerOrders = (userId: string) => {
    return cartItems.filter(item => item.user_id === userId);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading buyer data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Buyer Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyerStats.length}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{buyerStats.length > 0 ? (buyerStats.reduce((sum, buyer) => sum + buyer.totalSpent, 0) / buyerStats.reduce((sum, buyer) => sum + buyer.totalOrders, 0)).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{buyerStats.length > 0 ? buyerStats[0].totalSpent.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Highest total spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buyerStats.filter(buyer => buyer.totalOrders > 1).length}
            </div>
            <p className="text-xs text-muted-foreground">Multiple orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Overview</CardTitle>
          <CardDescription>View and manage your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyerStats.map((buyer) => (
                <TableRow key={buyer.user_id}>
                  <TableCell className="font-mono">{buyer.user_id.substring(0, 8)}...</TableCell>
                  <TableCell>{buyer.totalOrders}</TableCell>
                  <TableCell>₱{buyer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(buyer.lastOrderDate)}</TableCell>
                  <TableCell>
                    <Badge variant={buyer.totalOrders > 3 ? "default" : "secondary"}>
                      {buyer.totalOrders > 3 ? "VIP" : "Regular"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => viewBuyer(buyer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View detailed information about this customer</DialogDescription>
          </DialogHeader>
          {selectedBuyer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer ID</label>
                  <p className="font-mono text-sm">{selectedBuyer.user_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Customer Type</label>
                  <p>
                    <Badge variant={selectedBuyer.totalOrders > 3 ? "default" : "secondary"}>
                      {selectedBuyer.totalOrders > 3 ? "VIP Customer" : "Regular Customer"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Orders</label>
                  <p className="font-semibold">{selectedBuyer.totalOrders}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Spent</label>
                  <p className="font-semibold">₱{selectedBuyer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Order</label>
                  <p>{formatDate(selectedBuyer.lastOrderDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Avg. Order Value</label>
                  <p>₱{(selectedBuyer.totalSpent / selectedBuyer.totalOrders).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Order History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getBuyerOrders(selectedBuyer.user_id).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{order.products.name}</span>
                        <span className="text-sm text-gray-600 ml-2">Qty: {order.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₱{(order.products.price * order.quantity).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button className="flex-1" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as VIP
                </Button>
                <Button className="flex-1" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button className="flex-1" variant="destructive">
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerManagement;
