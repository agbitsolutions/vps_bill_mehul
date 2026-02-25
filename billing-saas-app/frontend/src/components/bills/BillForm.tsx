import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert,
  Stack,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useBills } from '../../hooks/useBills';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { Customer } from '../../types/customer';
import { Product } from '../../types/product';
import { Bill } from '../../types/bill';

interface BillFormProps {
  onClose?: () => void;
  showTitle?: boolean;
}

interface BillItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

const BillForm: React.FC<BillFormProps> = ({ onClose, showTitle = true }) => {
  const { createBill, isSubmitting } = useBills();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { customers, loading: customersLoading, refetch: refetchCustomers } = useCustomers();
  const { products, loading: productsLoading, refetch: refetchProducts, updateStock } = useProducts();
  const { suppliers } = useSuppliers();

  // Data is already loaded in context - no need to refetch on every open

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>('' as any);
  const [tax, setTax] = useState<number>('' as any);
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [redeemPoints, setRedeemPoints] = useState(false);
  const [error, setError] = useState<string>('');
  const [warning, setWarning] = useState<string>('');

  // Real-time Stock Validation & Clear Errors
  useEffect(() => {
    if (selectedProduct) {
      if (error.includes('Stock') || error.includes('product') || error.includes('Quantity')) {
        setError('');
      }
    }
  }, [selectedProduct]);

  const handleNumberKeyDown = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (selectedProduct && typeof selectedProduct.stock === 'number') {
      const existingItem = billItems.find(item => item.productId === selectedProduct.id);
      const existingQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequired = existingQuantity + (quantity || 0);

      if (totalRequired > selectedProduct.stock) {
        setError(`Insufficient Stock! Available: ${selectedProduct.stock}${existingQuantity > 0 ? ` (Already added ${existingQuantity})` : ''}`);
        setWarning('');
      } else if (selectedProduct.stock - totalRequired < 10) {
        setWarning(`Warning: Low stock after this sale. Remaining: ${selectedProduct.stock - totalRequired}`);
        setError('');
      } else {
        // Only clear if it was a stock-related error
        if (error.startsWith('Insufficient Stock')) setError('');
        setWarning('');
      }
    } else {
      setWarning('');
    }
  }, [selectedProduct, quantity, billItems]);

  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * (Number(tax) || 0)) / 100;
  const grossTotal = subtotal + taxAmount;

  const discountAmount = (selectedCustomer?.loyaltyPoints && redeemPoints)
    ? Math.min(selectedCustomer.loyaltyPoints, grossTotal * 0.10)
    : 0;

  const totalAmount = grossTotal - discountAmount;


  const handleAddProduct = () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    const currentQuantity = Number(quantity);

    // NEW LOGIC: Calculate Total Quantity (Existing + New)
    const existingItem = billItems.find(item => item.productId === selectedProduct.id);
    const existingQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequiredQuantity = existingQuantity + currentQuantity;

    if (selectedProduct.stock !== null && selectedProduct.stock !== undefined && totalRequiredQuantity > selectedProduct.stock) {
      setError(`Insufficient Stock! Total Required: ${totalRequiredQuantity}, Available: ${selectedProduct.stock}`);
      return;
    }

    if (existingItem) {
      // Update existing item instead of adding a duplicate row
      setBillItems(billItems.map(item =>
        item.productId === selectedProduct.id
          ? {
            ...item,
            quantity: item.quantity + currentQuantity,
            total: (item.quantity + currentQuantity) * selectedProduct.price
          }
          : item
      ));
    } else {
      // Add new item
      const newItem: BillItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: currentQuantity,
        price: selectedProduct.price,
        total: currentQuantity * selectedProduct.price,
      };
      setBillItems([...billItems, newItem]);
    }

    setSelectedProduct(null);
    setQuantity('' as any);
    setError('');
    setWarning('');
  };

  const handleRemoveProduct = (productId: string) => {
    setBillItems(billItems.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    // NEW LOGIC: Check stock when updating quantity directly in the table
    const product = products.find(p => p.id === productId);
    if (product && product.stock !== null && product.stock !== undefined && newQuantity > product.stock) {
      setError(`Insufficient Stock for ${product.name}! Available: ${product.stock}`);
      return;
    }

    const updatedItems = billItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price,
        };
      }
      return item;
    });
    setBillItems(updatedItems);
    if (error.startsWith('Insufficient Stock')) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (billItems.length === 0) {
      setError('Please add at least one product');
      return;
    }

    try {
      const paymentStatus: any = 'PAID';

      const branchId = localStorage.getItem('currentBranchId');

      // We send extended data to the API for processing
      const billPayload: any = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        supplierId: selectedSupplierId || null, // Added supplierId
        items: billItems,
        subtotal: subtotal,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        status: paymentStatus === 'PAID' ? 'Paid' : 'Pending',
        paymentStatus,
        dueDate: billDate,
        redeemPoints, // Flag for backend
        branchId // For multi-branch
      };

      const result = await createBill(billPayload);

      // Optimistic stock update - instantly reflects in UI without waiting for server
      updateStock(billItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })));

      // Dispatch events for real-time sync (non-blocking)
      window.dispatchEvent(new Event('inventory-updated'));
      window.dispatchEvent(new Event('bill-created'));
      window.dispatchEvent(new Event('refresh-notifications'));

      // Background sync after a short delay to not block UI
      setTimeout(() => {
        refetchProducts();
        refetchCustomers();
      }, 800);

      // Auto-open WhatsApp if URL is provided
      if (result && (result as any).whatsappUrl) {
        setTimeout(() => {
          window.open((result as any).whatsappUrl, '_blank');
        }, 500); // Small delay to ensure bill creation completes
      }

      if (onClose) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {showTitle && (
        <Typography variant="h4" gutterBottom>
          Create New Bill
        </Typography>
      )}

      {warning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warning}
        </Alert>
      )}
      {error && !error.includes('Stock') && !error.includes('product') && !error.includes('Quantity') && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Customer and Bill Details Row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3
          }}>
            {/* Customer & Supplier Selection */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Relationship Details
                </Typography>
                <Stack spacing={2}>
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => option.name}
                    value={selectedCustomer}
                    onChange={(_, newValue) => setSelectedCustomer(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Customer" required fullWidth />
                    )}
                  />

                  <Autocomplete
                    options={suppliers}
                    getOptionLabel={(option) => option.name}
                    value={suppliers.find(s => s.id === selectedSupplierId) || null}
                    onChange={(_, newValue) => setSelectedSupplierId(newValue?.id || '')}
                    renderInput={(params) => (
                      <TextField {...params} label="Link to Supplier (Optional)" fullWidth />
                    )}
                  />
                </Stack>

                {selectedCustomer && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email: {selectedCustomer.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {selectedCustomer.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Address: {selectedCustomer.address}
                    </Typography>
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
                      <Typography variant="subtitle2">Loyalty Points: {selectedCustomer.loyaltyPoints || 0}</Typography>
                    </Box>
                    <FormControlLabel
                      control={<Checkbox checked={redeemPoints} onChange={(e) => setRedeemPoints(e.target.checked)} disabled={!selectedCustomer.loyaltyPoints} />}
                      label="Redeem Points (Max 10%)"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Bill Details */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bill Details
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Bill Date"
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Tax (%)"
                    type="number"
                    value={tax}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setTax('' as any);
                      } else {
                        const numVal = parseFloat(val);
                        setTax(isNaN(numVal) ? 0 : Math.max(0, numVal));
                      }
                    }}
                    onKeyDown={handleNumberKeyDown}
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Product Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Products
              </Typography>
              {error && (error.includes('Stock') || error.includes('product') || error.includes('Quantity')) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                gap: 2,
                alignItems: 'end'
              }}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.name}
                  value={selectedProduct}
                  onChange={(_, newValue) => setSelectedProduct(newValue)}
                  loading={productsLoading}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Product"
                      fullWidth
                    />
                  )}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setQuantity('' as any);
                    } else {
                      const numVal = parseInt(val);
                      setQuantity(isNaN(numVal) ? 1 : Math.max(1, numVal));
                    }
                  }}
                  onKeyDown={handleNumberKeyDown}
                  fullWidth
                  inputProps={{ min: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  fullWidth
                  disabled={!selectedProduct}
                >
                  Add Product
                </Button>
                {/* Stock Helper Text */}
                {selectedProduct && typeof selectedProduct.stock === 'number' && (
                  <Typography variant="caption" color={selectedProduct.stock < 10 ? 'error' : 'textSecondary'} sx={{ display: 'block', mt: 1, textAlign: 'center', width: '100%' }}>
                    Available Stock: {selectedProduct.stock}
                  </Typography>
                )}

              </Box>
            </CardContent>
          </Card>

          {/* Bill Items Table */}
          {billItems.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bill Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                handleUpdateQuantity(item.productId, isNaN(val) ? 1 : Math.max(1, val));
                              }}
                              onKeyDown={handleNumberKeyDown}
                              size="small"
                              inputProps={{ min: 1, style: { textAlign: 'right' } }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveProduct(item.productId)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                {/* Bill Summary */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ minWidth: 300 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{formatCurrency(subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Tax ({tax}%):</Typography>
                      <Typography>{formatCurrency(taxAmount)}</Typography>
                    </Box>
                    {discountAmount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                        <Typography>Loyalty Discount:</Typography>
                        <Typography>-{formatCurrency(discountAmount)}</Typography>
                      </Box>
                    )}
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6">{formatCurrency(totalAmount)}</Typography>
                    </Box>

                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            justifyContent: { xs: 'stretch', sm: 'flex-end' },
            flexDirection: { xs: 'column', sm: 'row' },
            mt: 4
          }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onClose}
              fullWidth={isMobile}
              size={isMobile ? 'large' : 'medium'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!selectedCustomer || billItems.length === 0 || isSubmitting}
              fullWidth={isMobile}
              size={isMobile ? 'large' : 'medium'}
            >
              {isSubmitting ? 'Creating...' : 'Create Bill'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default BillForm;
