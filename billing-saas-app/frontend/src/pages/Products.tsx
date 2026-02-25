
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Alert,
  Fab,
  useTheme,
  useMediaQuery,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  Upload as UploadIcon,
  FilterList as FilterListIcon,
  GetApp as ExportIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import ProductForm from '../components/products/ProductForm';
import BulkProductManager from '../components/products/BulkProductManager';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types/product';
import { formatCurrency } from '../utils/currency';

const Products: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories'); // Replaced Date with Category as it fits products better
  const { products, deleteProduct, createProduct, updateProduct, error } = useProducts();

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  const handleOpen = () => {
    setOpen(true);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpen(true);
  };

  const handleBulkOpen = () => {
    setBulkOpen(true);
  };

  const handleBulkClose = () => {
    setBulkOpen(false);
  };

  const handleBulkImport = async (bulkProducts: Product[]) => {
    for (const product of bulkProducts) {
      const { id, createdAt, updatedAt, ...productData } = product;
      await createProduct(productData);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const handleProductSave = (product: Product) => {
    console.log('Product saved:', product);
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'list' | 'grid') => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Product Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your product catalog and inventory
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Controls Bar */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          flexWrap: 'wrap'
        }}>
          {/* Left Side: Search & Filters */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
            <TextField
              placeholder="Search products..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 } }}
            />
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 150 } }}
              label="Stock Status"
            >
              <MenuItem value="All Status">All Status</MenuItem>
              <MenuItem value="In Stock">In Stock</MenuItem>
              <MenuItem value="Low Stock">Low Stock</MenuItem>
              <MenuItem value="Out of Stock">Out of Stock</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 150 } }}
              label="Category"
            >
              <MenuItem value="All Categories">All Categories</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Services">Services</MenuItem>
              {/* Add dynamic categories if available */}
            </TextField>
          </Box>

          {/* Right Side: Actions */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            flexWrap: 'wrap'
          }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
              aria-label="view mode"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleBulkOpen}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Import
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Add Product
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Products Content */}
      {filteredProducts.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" sx={{ px: 3 }}>Product Name</TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>Description</TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>Category</TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>Supplier</TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>Price</TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>Stock</TableCell>
                    <TableCell align="left" sx={{ px: 3 }}>Status</TableCell>
                    <TableCell align="right" sx={{ px: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell align="left" sx={{ px: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                            <InventoryIcon fontSize="small" />
                          </Avatar>
                          <Typography fontWeight="medium" noWrap variant="body2">{product.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="left" sx={{ px: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary" noWrap title={product.description || ''}>
                          {product.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="left" sx={{ px: 3 }}>
                        <Chip
                          label={product.category || 'Uncategorized'}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: 'divider', height: 24 }}
                        />
                      </TableCell>
                      <TableCell align="left" sx={{ px: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" noWrap>
                          {(product as any).supplier?.name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="left" sx={{ px: 3 }}>
                        <Typography fontWeight="bold" variant="body2">{formatCurrency(product.price)}</Typography>
                      </TableCell>
                      <TableCell align="left" sx={{ px: 3 }}>
                        <Typography variant="body2">{product.stock || 0}</Typography>
                      </TableCell>
                      <TableCell align="left" sx={{ px: 3 }}>
                        <Chip
                          label={
                            !product.stock || product.stock <= 0 ? "Out" :
                              product.stock <= 10 ? "Low" : "In Stock"
                          }
                          size="small"
                          color={
                            !product.stock || product.stock <= 0 ? "error" :
                              product.stock <= 10 ? "warning" : "success"
                          }
                          variant="outlined"
                          sx={{ height: 24, minWidth: 70 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ px: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => handleEdit(product)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)'
              },
              gap: 3
            }}>
              {filteredProducts.map((product) => (
                <Card sx={{ height: '100%', position: 'relative' }} key={product.id}>
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEdit(product)}
                          sx={{ minWidth: 'auto', p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(product.id)}
                          sx={{ minWidth: 'auto', p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {product.description && (
                        <Typography variant="body2" color="text.secondary" sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatCurrency(product.price)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Stock: {product.stock || 0} units
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={
                            !product.stock || product.stock <= 0 ? "Out of Stock" :
                              product.stock <= 10 ? "Low Stock" : "In Stock"
                          }
                          size="small"
                          color={
                            !product.stock || product.stock <= 0 ? "error" :
                              product.stock <= 10 ? "warning" : "success"
                          }
                          variant={product.stock && product.stock <= 10 ? "filled" : "outlined"}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Added {new Date(product.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No products found' : 'No products yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start by adding your first product to get started'
            }
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
              Add Your First Product
            </Button>
          )}
        </Paper>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add product"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000
          }}
          onClick={handleOpen}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={open}
        onClose={handleClose}
        product={editingProduct}
        onSave={handleProductSave}
      />

      {/* Bulk Product Manager Dialog */}
      <BulkProductManager
        open={bulkOpen}
        onClose={handleBulkClose}
        onBulkImport={handleBulkImport}
      />
    </Box>
  );
};

export default Products;
