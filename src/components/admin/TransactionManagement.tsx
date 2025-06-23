
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, CheckCircle, XCircle, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExcelExport from "./ExcelExport";
import TransactionForm from "./TransactionForm";

interface Transaction {
  id: string;
  buyer_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  transaction_date: string;
  status: string;
  payment_method: string;
  notes: string;
  created_at: string;
  buyers: {
    full_name: string;
    email: string;
    phone: string;
  } | null;
  products: {
    name: string;
    category: string;
    image_url: string;
  } | null;
}

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          buyers (
            full_name,
            email,
            phone
          ),
          products (
            name,
            category,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      console.log('Transactions fetched successfully:', data?.length || 0);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transactionId);

      if (error) throw error;
      
      toast.success('Transaction status updated');
      fetchTransactions();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction status');
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const viewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const editTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const addNewTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleTransactionSaved = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredTransactions = statusFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === statusFilter);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading transactions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction Management</h2>
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addNewTransaction} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <ExcelExport />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{transactions.reduce((sum, t) => sum + Number(t.total_amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From all transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>View and manage customer orders ({filteredTransactions.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {transaction.products?.image_url && (
                        <img 
                          src={transaction.products.image_url} 
                          alt={transaction.products.name} 
                          className="w-8 h-8 rounded object-cover" 
                        />
                      )}
                      <div>
                        <span className="font-medium">{transaction.products?.name || 'Unknown Product'}</span>
                        <div className="text-sm text-gray-500">{transaction.products?.category || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{transaction.buyers?.full_name || 'Unknown Buyer'}</span>
                      <div className="text-sm text-gray-500">{transaction.buyers?.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>₱{Number(transaction.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => viewTransaction(transaction)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => editTransaction(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteTransaction(transaction.id)}>
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

      {/* View Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View and manage transaction information</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {selectedTransaction.products.image_url && (
                  <img 
                    src={selectedTransaction.products.image_url} 
                    alt={selectedTransaction.products.name} 
                    className="w-16 h-16 rounded object-cover" 
                  />
                )}
                <div>
                  <h3 className="font-semibold">{selectedTransaction.products.name}</h3>
                  <p className="text-sm text-gray-600">{selectedTransaction.products.category}</p>
                  <p className="text-sm text-gray-600">₱{Number(selectedTransaction.unit_price).toFixed(2)} each</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer</label>
                  <p>{selectedTransaction.buyers.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedTransaction.buyers.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p>{selectedTransaction.buyers.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <p>{selectedTransaction.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Unit Price</label>
                  <p>₱{Number(selectedTransaction.unit_price).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="font-semibold">₱{Number(selectedTransaction.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <p>{selectedTransaction.payment_method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Transaction Date</label>
                  <p>{formatDate(selectedTransaction.transaction_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-gray-600">{selectedTransaction.notes}</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => updateTransactionStatus(selectedTransaction.id, 'completed')}
                  disabled={selectedTransaction.status === 'completed'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => updateTransactionStatus(selectedTransaction.id, 'pending')}
                  disabled={selectedTransaction.status === 'pending'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Pending
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? 'Update transaction details' : 'Create a new transaction'}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            transaction={editingTransaction}
            onSave={handleTransactionSaved}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionManagement;
