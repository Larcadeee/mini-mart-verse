
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products: {
    name: string;
    price: number;
    image_url: string;
  };
}

const TransactionManagement = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<CartItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            name,
            price,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const viewTransaction = (transaction: CartItem) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRandomStatus = () => {
    const statuses = ['Pending', 'Verified', 'Processing', 'Completed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cartItems.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From cart items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(cartItems.length * 0.3)}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(cartItems.length * 0.7)}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => {
                const status = getRandomStatus();
                const amount = item.products.price * item.quantity;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {item.products.image_url && (
                          <img src={item.products.image_url} alt={item.products.name} className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="font-medium">{item.products.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.user_id.substring(0, 8)}...</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₱{amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        status === 'Completed' ? 'default' :
                        status === 'Verified' ? 'default' :
                        status === 'Processing' ? 'secondary' : 'destructive'
                      }>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => viewTransaction(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View detailed information about this transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedTransaction.products.image_url && (
                  <img src={selectedTransaction.products.image_url} alt={selectedTransaction.products.name} className="w-16 h-16 rounded object-cover" />
                )}
                <div>
                  <h3 className="font-semibold">{selectedTransaction.products.name}</h3>
                  <p className="text-sm text-gray-600">₱{selectedTransaction.products.price.toFixed(2)} each</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer ID</label>
                  <p className="font-mono text-sm">{selectedTransaction.user_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <p>{selectedTransaction.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="font-semibold">₱{(selectedTransaction.products.price * selectedTransaction.quantity).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p>{formatDate(selectedTransaction.created_at)}</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button className="flex-1" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Verified
                </Button>
                <Button className="flex-1" variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Pending
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionManagement;
