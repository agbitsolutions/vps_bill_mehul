import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Share,
  FilterList,
  MoreVert,
  PictureAsPdf,
  Description,
  Person,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import BillForm from '../components/bills/BillForm';
import { useBills } from '../hooks/useBills';
import { generateBillPDF } from '../utils/pdfGenerator';
import { exportBillHistory } from '../utils/exportUtils';

const Bills: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [viewCustomerOpen, setViewCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const { bills, deleteBill, loading, error } = useBills();

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleDelete = async (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      try {
        await deleteBill(billId);
        showMessage('Bill deleted successfully');
      } catch (err) {
        showMessage(err instanceof Error ? err.message : 'Failed to delete bill', 'error');
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, billId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedBill(billId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBill(null);
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'list' | 'grid') => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleViewCustomer = (bill: any) => {
    if (bill.customer) {
      setSelectedCustomer(bill.customer);
    } else {
      setSelectedCustomer({
        name: bill.customerName,
        email: bill.customerEmail,
        phone: 'N/A',
        address: 'N/A'
      });
    }
    setViewCustomerOpen(true);
  };

  const handleDownloadBill = (billId: string, format: 'pdf' | 'excel') => {
    const bill = bills.find(b => b.id === billId);

    if (!bill) {
      showMessage('Error: Bill data not found!', 'error');
      return;
    }

    if (format === 'pdf') {
      navigate(`/bills/view/${billId}?autoDownload=true`);
    } else if (format === 'excel') {
      try {
        exportBillHistory([bill]);
        showMessage('Excel export started');
      } catch (err) {
        showMessage(`Failed to export Excel: ${err instanceof Error ? err.message : String(err)}`, 'error');
      }
    }
    handleMenuClose();
  };

  const handleShareBill = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const shareUrl = `${window.location.origin}/bills/view/${bill.id}`;
    const shareData = {
      title: `Invoice ${bill.billNumber || bill.id}`,
      text: `View invoice details for ${bill.customerName}`,
      url: shareUrl
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => showMessage('Shared successfully'))
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
            copyToClipboard(shareUrl);
          }
        });
    } else {
      copyToClipboard(shareUrl);
    }
    handleMenuClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('Bill link copied to clipboard!');
  };

  const handleViewBill = (billId: string) => {
    navigate(`/bills/view/${billId}`);
  };

  const handleExportAll = (format: 'pdf' | 'excel') => {
    if (filteredBills.length === 0) {
      alert('No bills to export');
      return;
    }

    if (format === 'excel') {
      exportBillHistory(filteredBills);
    } else {
      alert('Bulk PDF export is currently limited. Please export individually or use Excel for reports.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  const filteredBills = bills.filter(bill => {
    // Search filter
    const matchesSearch = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || bill.status?.toLowerCase() === statusFilter.toLowerCase();

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all' && bill.createdAt) {
      const billDate = new Date(bill.createdAt);
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      switch (dateFilter) {
        case 'today':
          matchesDate = billDate >= startOfToday;
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = billDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          matchesDate = billDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
          matchesDate = billDate >= quarterAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Bill Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create, manage and track all your bills and invoices
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          mb: showFilters ? 2 : 0
        }}>
          <TextField
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: 1,
              maxWidth: { sm: 400 }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  minWidth: { xs: '100%', sm: 'auto' },
                  bgcolor: showFilters ? 'primary.main' : 'transparent',
                  color: showFilters ? 'white' : 'primary.main',
                  borderColor: showFilters ? 'primary.main' : undefined,
                  '&:hover': {
                    bgcolor: showFilters ? 'primary.dark' : 'rgba(48, 92, 222, 0.04)',
                    borderColor: showFilters ? 'primary.dark' : 'primary.main'
                  }
                }}
              >
                Filters
              </Button>
            </Tooltip>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
              aria-label="view mode"
              sx={{ display: { xs: 'none', md: 'flex' } }}
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
              startIcon={<DownloadIcon />}
              onClick={() => handleExportAll('excel')}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Export Bills
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Create Bill
            </Button>
          </Box>
        </Box>

        {/* Filters Section */}
        {showFilters && (
          <Paper
            sx={{
              p: 2,
              bgcolor: '#F9FAFC',
              border: '1px solid #E6E9F0'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Range"
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="quarter">Last 3 Months</MenuItem>
                </Select>
              </FormControl>

              {(statusFilter !== 'all' || dateFilter !== 'all') && (
                <Button
                  size="small"
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  Clear Filters
                </Button>
              )}

              <Box sx={{ flexGrow: 1 }} />

              <Typography variant="body2" color="text.secondary">
                Showing {filteredBills.length} of {bills.length} bills
              </Typography>
            </Stack>
          </Paper>
        )}
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Bills Table */}
      {filteredBills.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <Paper sx={{ overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBills.map((bill) => (
                      <TableRow key={bill.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight="medium">
                              #{bill.billNumber || bill.id.slice(0, 8)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {bill.customerName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            ₹{bill.totalAmount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={bill.status}
                            size="small"
                            color={getStatusColor(bill.status) as any}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(bill.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="View Bill">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewBill(bill.id)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Bill">
                              <IconButton size="small" color="default">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More Actions">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, bill.id)}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
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
              {filteredBills.map((bill) => (
                <Card key={bill.id} sx={{ height: '100%', '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon fontSize="small" color="action" />
                        <Typography fontWeight="bold" variant="subtitle1">
                          #{bill.billNumber || bill.id.slice(0, 8)}
                        </Typography>
                      </Box>
                      <Chip
                        label={bill.status}
                        size="small"
                        color={getStatusColor(bill.status) as any}
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                      {bill.customerName}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ₹{bill.totalAmount}
                      </Typography>

                      <Box>
                        <IconButton size="small" color="primary" onClick={() => handleViewBill(bill.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, bill.id)}>
                          <MoreVert fontSize="small" />
                        </IconButton>
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
            {searchTerm ? 'No bills found' : 'No bills yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start by creating your first bill'
            }
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
              Create Your First Bill
            </Button>
          )}
        </Paper>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="create bill"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleOpen}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Create Bill Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Create New Bill</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <BillForm onClose={handleClose} showTitle={false} />
        </DialogContent>
      </Dialog>

      {/* Action Menu for Download/Share/Delete */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedBill && handleDownloadBill(selectedBill, 'pdf')}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedBill && handleDownloadBill(selectedBill, 'excel')}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedBill && handleShareBill(selectedBill)}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Bill Link</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedBill) handleDelete(selectedBill);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Bill</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Customer Dialog */}
      <Dialog
        open={viewCustomerOpen}
        onClose={() => setViewCustomerOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" /> Customer Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedCustomer && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedCustomer.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedCustomer.email || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{selectedCustomer.phone || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Address</Typography>
                <Typography variant="body1">{selectedCustomer.address || 'N/A'}</Typography>
              </Box>
              {selectedCustomer.loyaltyPoints !== undefined && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Loyalty Points</Typography>
                  <Chip label={selectedCustomer.loyaltyPoints} size="small" color="primary" variant="outlined" />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setViewCustomerOpen(false)}>Close</Button>
        </Box>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Bills;
