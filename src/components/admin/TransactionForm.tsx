
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TransactionFormProps {
  transaction?: any;
  onSave: () => void;
  onCancel: () => void;
}

interface Buyer {
  id: string;
  full_name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const TransactionForm = ({ transaction, onSave, onCancel }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    buyer_id: '',
    product_id: '',
    quantity: 1,
    unit_price: 0,
    total_amount: 0,
    status: 'pending',
    payment_method: 'cash',
    notes: ''
  });
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuyers();
    fetchProducts();
    
    if (transaction) {
      setFormData({
        buyer_id: transaction.buyer_id || '',
        product_id: transaction.product_id || '',
        quantity: transaction.quantity || 1,
        unit_price: Number(transaction.unit_price) || 0,
        total_amount: Number(transaction.total_amount) || 0,
        status: transaction.status || 'pending',
        payment_method: transaction.payment_method || 'cash',
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  useEffect(() => {
    const total = formData.quantity * formData.unit_price;
    setFormData(prev => ({ ...prev, total_amount: total }));
  }, [formData.quantity, formData.unit_price]);

  const fetchBuyers = async () => {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setBuyers(data || []);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      toast.error('Failed to load buyers');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_id: productId,
        unit_price: Number(product.price)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.buyer_id || !formData.product_id) {
        toast.error('Please select both buyer and product');
        return;
      }

      const transactionData = {
        buyer_id: formData.buyer_id,
        product_id: formData.product_id,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_amount: formData.total_amount,
        status: formData.status,
        payment_method: formData.payment_method,
        notes: formData.notes.trim(),
        transaction_date: new Date().toISOString()
      };

      if (transaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);

        if (error) throw error;
        toast.success('Transaction updated successfully');
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;
        toast.success('Transaction created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buyer">Customer *</Label>
          <Select value={formData.buyer_id} onValueChange={(value) => setFormData({...formData, buyer_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {buyers.map((buyer) => (
                <SelectItem key={buyer.id} value={buyer.id}>
                  {buyer.full_name} ({buyer.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="product">Product *</Label>
          <Select value={formData.product_id} onValueChange={handleProductChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} (₱{product.price} - Stock: {product.stock})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
            required
          />
        </div>

        <div>
          <Label htmlFor="unit_price">Unit Price (₱) *</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.unit_price}
            onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})}
            required
          />
        </div>

        <div>
          <Label htmlFor="total_amount">Total Amount (₱)</Label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            value={formData.total_amount.toFixed(2)}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
              <SelectItem value="gcash">GCash</SelectItem>
              <SelectItem value="paymaya">PayMaya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes about the transaction..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
