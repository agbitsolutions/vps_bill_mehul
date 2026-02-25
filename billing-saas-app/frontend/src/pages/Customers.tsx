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
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  useTheme,
  useMediaQuery,
  MenuItem,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  FilterList as FilterListIcon,
  GetApp as ExportIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import CustomerForm from '../components/customers/CustomerForm';
import { useCustomers } from '../hooks/useCustomers';

const Customers: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState('All Time');
  const { customers, deleteCustomer } = useCustomers();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleDelete = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(customerId);
    }
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'list' | 'grid') => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Customer Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your customer database and contact information
        </Typography>
      </Box>

      {/* Controls Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
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
              placeholder="Search customers..."
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
              label="Status"
            >
              <MenuItem value="All Status">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 150 } }}
              label="Date Range"
            >
              <MenuItem value="All Time">All Time</MenuItem>
              <MenuItem value="This Month">This Month</MenuItem>
              <MenuItem value="Last Month">Last Month</MenuItem>
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
              startIcon={<FilterListIcon />}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Add Customer
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Content Area */}
      {filteredCustomers.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Contact Info</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="center">Loyalty Points</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight="medium">{customer.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          {customer.email && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{customer.email}</Typography>
                            </Box>
                          )}
                          {customer.phone && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{customer.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }} noWrap>
                          {customer.address || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={customer.loyaltyPoints || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label="Active" color="success" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => { }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(customer.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
              {filteredCustomers.map((customer) => (
                <Card sx={{ height: '100%', position: 'relative' }} key={customer.id}>
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {customer.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ minWidth: 32, width: 32, height: 32, p: 0 }}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(customer.id)}
                          sx={{ minWidth: 32, width: 32, height: 32, p: 0 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {customer.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {customer.email}
                          </Typography>
                        </Box>
                      )}

                      {customer.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Box>
                      )}

                      {customer.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {customer.address}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {customer.loyaltyPoints !== undefined && customer.loyaltyPoints > 0 && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.lighter', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="primary.dark" fontWeight="medium" display="block">
                          Loyalty Points
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {customer.loyaltyPoints}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Added {new Date(customer.createdAt).toLocaleDateString()}
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
            {searchTerm ? 'No customers found' : 'No customers yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start by adding your first customer to get started'
            }
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
              Add Your First Customer
            </Button>
          )}
        </Paper>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add customer"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add Customer Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <CustomerForm onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Customers;
