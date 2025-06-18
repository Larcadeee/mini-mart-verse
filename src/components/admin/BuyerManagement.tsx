
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Mail, Ban, CheckCircle, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Buyer {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  registration_date: string;
  total_orders: number;
  total_spent: number;
  status: string;
  created_at: string;
}

const BuyerManagement = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    status: 'active'
  });

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuyers(data || []);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBuyer) {
        const { error } = await supabase
          .from('buyers')
          .update(formData)
          .eq('id', editingBuyer.id);

        if (error) throw error;
        toast.success('Buyer updated successfully');
      } else {
        const { error } = await supabase
          .from('buyers')
          .insert([formData]);

        if (error) throw error;
        toast.success('Buyer added successfully');
      }

      setIsAddDialogOpen(false);
      setEditingBuyer(null);
      resetForm();
      fetchBuyers();
    } catch (error) {
      console.error('Error saving buyer:', error);
      toast.error('Failed to save buyer');
    }
  };

  const handleEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      email: buyer.email,
      full_name: buyer.full_name,
      phone: buyer.phone || '',
      address: buyer.address || '',
      status: buyer.status
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (buyerId: string) => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;

    try {
      const { error } = await supabase
        .from('buyers')
        .delete()
        .eq('id', buyerId);

      if (error) throw error;
      toast.success('Buyer deleted successfully');
      fetchBuyers();
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast.error('Failed to delete buyer');
    }
  };

  const updateBuyerStatus = async (buyerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('buyers')
        .update({ status: newStatus })
        .eq('id', buyerId);

      if (error) throw error;
      toast.success('Buyer status updated');
      fetchBuyers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating buyer status:', error);
      toast.error('Failed to update buyer status');
    }
  };

  const viewBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      address: '',
      status: 'active'
    });
  };

  const openAddDialog = () => {
    setEditingBuyer(null);
    resetForm();
    setIsAddDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const avgOrderValue = buyers.length > 0 
    ? buyers.reduce((sum, buyer) => sum + buyer.total_spent, 0) / buyers.reduce((sum, buyer) => sum + buyer.total_orders, 0) || 0
    : 0;

  const topSpender = buyers.length > 0 
    ? Math.max(...buyers.map(buyer => buyer.total_spent))
    : 0;

  const repeatCustomers = buyers.filter(buyer => buyer.total_orders > 1).length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading buyers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Buyer Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Buyer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBuyer ? 'Edit Buyer' : 'Add New Buyer'}</DialogTitle>
              <DialogDescription>
                {editingBuyer ? 'Update buyer information' : 'Add a new buyer to the system'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+63 XXX XXX XXXX"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBuyer ? 'Update Buyer' : 'Add Buyer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyers.length}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{topSpender.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Highest total spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatCustomers}</div>
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
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{buyer.full_name}</span>
                      <div className="text-sm text-gray-500">
                        Joined {formatDate(buyer.registration_date)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{buyer.email}</TableCell>
                  <TableCell>{buyer.phone || 'N/A'}</TableCell>
                  <TableCell>{buyer.total_orders}</TableCell>
                  <TableCell>₱{buyer.total_spent.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={buyer.status === 'active' ? "default" : "destructive"}>
                      {buyer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => viewBuyer(buyer)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(buyer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(buyer.id)}>
                        <Trash2 className="h-4 w-4" />
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
            <DialogDescription>View detailed customer information</DialogDescription>
          </DialogHeader>
          {selectedBuyer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="font-semibold">{selectedBuyer.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{selectedBuyer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p>{selectedBuyer.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <p>{selectedBuyer.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Orders</label>
                  <p className="font-semibold">{selectedBuyer.total_orders}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Spent</label>
                  <p className="font-semibold">₱{selectedBuyer.total_spent.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Registration Date</label>
                  <p>{formatDate(selectedBuyer.registration_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={selectedBuyer.status === 'active' ? "default" : "destructive"}>
                    {selectedBuyer.status}
                  </Badge>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => updateBuyerStatus(selectedBuyer.id, 'active')}
                  disabled={selectedBuyer.status === 'active'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => updateBuyerStatus(selectedBuyer.id, 'suspended')}
                  disabled={selectedBuyer.status === 'suspended'}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
                <Button className="flex-1" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
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
