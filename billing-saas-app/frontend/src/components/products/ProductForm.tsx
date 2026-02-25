import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
  Chip,
  Box,
  Alert,
  Autocomplete,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CurrencyRupee as MoneyIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  Person
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Product } from '../../types/product';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave?: (product: Product) => void;
}

interface ValidationErrors {
  name?: string;
  price?: string;
  taxRate?: string;
  stock?: string;
  sku?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  product: initialProduct,
  onSave
}) => {
  const { createProduct, updateProduct } = useProducts();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { suppliers } = useSuppliers();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<Array<{ key: string, value: string }>>([]);

  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: '' as any,
    taxRate: 0,
    tax: 0,
    stock: '' as any,
    quantity: 1 as any,
    category: '',
    sku: '',
    createdAt: '',
    updatedAt: '',
    customFields: {}
  });

  // Categories for suggestions
  const productCategories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Automotive',
    'Office Supplies',
    'Food & Beverages',
    'Software & Services',
    'Hardware',
    'Accessories'
  ];

  // Tax rates for suggestions
  const commonTaxRates = [
    { label: 'No Tax (0%)', value: 0 },
    { label: 'GST Standard (18%)', value: 18 },
    { label: 'GST Reduced (12%)', value: 12 },
    { label: 'GST Lower (5%)', value: 5 },
    { label: 'IGST (18%)', value: 18 },
    { label: 'Custom Rate', value: -1 }
  ];

  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
      // Convert custom fields object to array for editing
      if (initialProduct.customFields) {
        const fieldsArray = Object.entries(initialProduct.customFields).map(([key, value]) => ({
          key,
          value: String(value)
        }));
        setCustomFields(fieldsArray);
      }
    } else {
      // Reset form for new product
      setFormData({
        id: '',
        name: '',
        description: '',
        price: '' as any,
        taxRate: 0,
        tax: 0,
        stock: '' as any,
        quantity: 1 as any,
        category: '',
        sku: '',
        supplierId: '',
        createdAt: '',
        updatedAt: '',
        customFields: {}
      });
      setCustomFields([]);
    }
    setErrors({});
    setSubmitError(null);
  }, [initialProduct, open]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.taxRate && (formData.taxRate < 0 || formData.taxRate > 100)) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (formData.sku && formData.sku.trim().length > 0 && formData.sku.trim().length < 3) {
      newErrors.sku = 'SKU must be at least 3 characters if provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (field: keyof Product) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    let updatedData = { ...formData };

    if (field === 'price' || field === 'taxRate' || field === 'stock' || field === 'quantity') {
      if (value === '') {
        (updatedData as any)[field] = '' as any;
      } else {
        const numValue = parseFloat(value);
        (updatedData as any)[field] = isNaN(numValue) ? 0 : numValue;
      }
    } else {
      (updatedData as any)[field] = value;
    }

    // Sync tax and taxRate fields
    if (field === 'taxRate') {
      updatedData.tax = Number(value) || 0;
    }

    setFormData(updatedData);

    // Dynamic field validation
    const newErrors = { ...errors };
    if (field === 'name') {
      if (!value.trim()) newErrors.name = 'Product name is required';
      else if (value.trim().length > 50) newErrors.name = 'Name must be 50 characters or less';
      else delete newErrors.name;
    }
    if (field === 'price') {
      if (parseFloat(value) < 0) newErrors.price = 'Price cannot be negative';
      else delete newErrors.price;
    }
    if (field === 'stock') {
      if (parseInt(value) < 0) newErrors.stock = 'Stock cannot be negative';
      else delete newErrors.stock;
    }

    setErrors(newErrors);
    if (submitError) setSubmitError(null);
  };

  const handleCategoryChange = (event: any, value: string | null) => {
    setFormData(prev => ({ ...prev, category: value || '' }));
  };

  const handleTaxRateSelect = (event: any) => {
    const value = event.target.value;
    if (value === -1) {
      // Custom rate - don't change anything, let user input
      return;
    }
    setFormData(prev => ({
      ...prev,
      taxRate: value,
      tax: value
    }));
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    setCustomFields(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert custom fields array back to object
      const customFieldsObject = customFields.reduce((acc, field) => {
        if (field.key.trim()) {
          acc[field.key.trim()] = field.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        category: formData.category?.trim() || '',
        sku: formData.sku?.trim() || '',
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        quantity: Number(formData.quantity) || 0,
        taxRate: Number(formData.taxRate) || 0,
        customFields: customFieldsObject,
        updatedAt: new Date().toISOString()
      };

      if (initialProduct?.id) {
        // Update existing product
        await updateProduct({
          ...productData,
          id: initialProduct.id,
          createdAt: initialProduct.createdAt
        });
      } else {
        // Create new product
        const { id, createdAt, updatedAt, ...productDataWithoutId } = productData;
        await createProduct(productDataWithoutId);
      }

      if (onSave) {
        onSave(productData);
      }

      // Trigger global inventory update for Smart Merge / Updates
      window.dispatchEvent(new Event('inventory-updated'));
      window.dispatchEvent(new Event('refresh-notifications'));

      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setSubmitError(error.data?.error || error.message || 'Failed to save product. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = Boolean(initialProduct?.id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <InventoryIcon color="primary" />
          <Typography variant="h6">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Error Message */}
            {submitError && (
              <Alert severity="error" onClose={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            )}

            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
                sx={{ flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={handleChange('sku')}
                error={Boolean(errors.sku)}
                helperText={errors.sku || 'Stock Keeping Unit'}
                placeholder="e.g., PROD-001"
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              placeholder="Enter product description..."
            />

            <Autocomplete
              freeSolo
              options={productCategories}
              value={formData.category}
              onChange={handleCategoryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  placeholder="Select or type category"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Pricing & Tax */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Pricing & Tax
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleChange('price')}
                onKeyDown={handleNumberKeyDown}
                error={Boolean(errors.price)}
                helperText={errors.price}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Tax Rate</InputLabel>
                  <Select
                    value={commonTaxRates.find(rate => rate.value === formData.taxRate)?.value || -1}
                    onChange={handleTaxRateSelect}
                    label="Tax Rate"
                  >
                    {commonTaxRates.map((rate) => (
                      <MenuItem key={rate.value} value={rate.value}>
                        {rate.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Tax Rate (%)"
                  type="number"
                  value={formData.taxRate}
                  onChange={handleChange('taxRate')}
                  onKeyDown={handleNumberKeyDown}
                  error={Boolean(errors.taxRate)}
                  helperText={errors.taxRate}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Inventory */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Inventory
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={handleChange('stock')}
                onKeyDown={handleNumberKeyDown}
                error={Boolean(errors.stock)}
                helperText={errors.stock || 'Current stock on hand'}
                inputProps={{ min: 0 }}
                sx={{ flex: 1 }}
              />

              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplierId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                  label="Supplier"
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <Person fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>None (No Supplier)</em>
                  </MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                  Who provides this stock?
                </Typography>
              </FormControl>
            </Box>

            {/* Custom Fields */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color="primary">
                  Custom Fields
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addCustomField}
                  variant="outlined"
                  size="small"
                >
                  Add Field
                </Button>
              </Box>
            </Box>

            {customFields.map((field, index) => (
              <Card variant="outlined" sx={{ p: 2 }} key={index}>
                <Box display="flex" gap={2} alignItems="start">
                  <TextField
                    label="Field Name"
                    value={field.key}
                    onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    label="Value"
                    value={field.value}
                    onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <IconButton
                    onClick={() => removeCustomField(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          gap: 1.5,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: 'stretch'
        }}>
          <Button
            onClick={onClose}
            startIcon={<CancelIcon />}
            disabled={loading}
            fullWidth={isMobile}
            variant="outlined"
            size={isMobile ? 'large' : 'medium'}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            loading={loading}
            disabled={Object.keys(errors).length > 0 || !formData.name.trim()}
            loadingPosition="start"
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
          >
            {isEditMode ? 'Update Product' : 'Create Product'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
