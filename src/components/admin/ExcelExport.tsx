
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ExcelExport = () => {
  const exportToExcel = async () => {
    try {
      // Fetch transaction data with related information
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          buyers:buyer_id (
            full_name,
            email,
            phone
          ),
          products:product_id (
            name,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert data to CSV format
      const csvHeaders = [
        'Transaction ID',
        'Date',
        'Buyer Name',
        'Buyer Email',
        'Product Name',
        'Category',
        'Quantity',
        'Unit Price',
        'Total Amount',
        'Status',
        'Payment Method'
      ];

      const csvData = transactions?.map(transaction => [
        transaction.id,
        new Date(transaction.created_at).toLocaleDateString(),
        transaction.buyers?.full_name || 'N/A',
        transaction.buyers?.email || 'N/A',
        transaction.products?.name || 'N/A',
        transaction.products?.category || 'N/A',
        transaction.quantity,
        `₱${transaction.unit_price.toFixed(2)}`,
        `₱${transaction.total_amount.toFixed(2)}`,
        transaction.status,
        transaction.payment_method
      ]) || [];

      // Create CSV content
      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Transaction data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transaction data');
    }
  };

  return (
    <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
      <Download className="h-4 w-4 mr-2" />
      Export to Excel
    </Button>
  );
};

export default ExcelExport;
