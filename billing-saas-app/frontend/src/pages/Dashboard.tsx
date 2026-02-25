import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  WhatsApp as WhatsAppIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBills } from '../hooks/useBills';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import useRoleBasedAccess from '../hooks/useRoleBasedAccess';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/currency';
import InventoryAlerts from '../components/dashboard/InventoryAlerts';
import LowStockBadge from '../components/common/LowStockBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, onClick }) => {
  const changeColor = changeType === 'positive' ? 'success.main' : changeType === 'negative' ? 'error.main' : 'text.secondary';

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: changeColor, fontWeight: 500 }}>
              {change}
            </Typography>
          </Box>
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const permissions = useRoleBasedAccess();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Get real data from hooks
  const { bills, loading: billsLoading } = useBills();
  const { customers, loading: customersLoading } = useCustomers();
  const { products, loading: productsLoading } = useProducts();
  const { expenses, loading: expensesLoading } = useExpenses();

  // Calculate real metrics
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalBills = bills.length;
  const activeCustomers = customers.length;
  const totalProducts = products.length;

  // Get recent bills (last 5)
  const recentBillsFromAPI = bills
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(bill => ({
      id: bill.id,
      customer: bill.customerName,
      amount: formatCurrency(bill.totalAmount),
      status: bill.status,
      date: new Date(bill.createdAt).toLocaleDateString()
    }));

  // Fallback sample data if no bills are available
  const sampleRecentBills = [
    { id: 'INV-001', customer: 'Acme Corporation', amount: '₹15,250', status: 'Paid', date: new Date().toLocaleDateString() },
    { id: 'INV-002', customer: 'Tech Solutions Inc', amount: '₹8,900', status: 'Pending', date: new Date(Date.now() - 86400000).toLocaleDateString() },
    { id: 'INV-003', customer: 'Global Enterprises', amount: '₹22,100', status: 'Paid', date: new Date(Date.now() - 172800000).toLocaleDateString() },
    { id: 'INV-004', customer: 'Local Business Co', amount: '₹5,750', status: 'Overdue', date: new Date(Date.now() - 259200000).toLocaleDateString() },
    { id: 'INV-005', customer: 'Digital Agency Ltd', amount: '₹12,300', status: 'Draft', date: new Date(Date.now() - 345600000).toLocaleDateString() },
  ];

  // Use API data if available, otherwise use sample data
  const recentBills = recentBillsFromAPI.length > 0 ? recentBillsFromAPI : sampleRecentBills;

  // Calculate month-over-month growth (mock calculation for now)
  const revenueGrowth = "+12.5% from last month";
  const billsGrowth = "+8.2% from last month";
  const customersGrowth = "+3.4% from last month";
  const productsGrowth = "No change";

  // Sample data for detailed views
  const revenueBreakdown = [
    { source: 'Product Sales', amount: '₹18,450', percentage: '75%' },
    { source: 'Service Charges', amount: '₹4,200', percentage: '17%' },
    { source: 'Late Fees', amount: '₹1,200', percentage: '5%' },
    { source: 'Other', amount: '₹717', percentage: '3%' },
  ];

  const billsBreakdown = [
    { status: 'Paid', count: 89, amount: '₹18,450' },
    { status: 'Pending', count: 34, amount: '₹4,200' },
    { status: 'Overdue', count: 12, amount: '₹1,200' },
    { status: 'Draft', count: 21, amount: '₹717' },
  ];

  const topActiveCustomers = [
    { name: 'Acme Corp', email: 'contact@acme.com', totalBills: 12, totalAmount: '₹5,400' },
    { name: 'TechStart Inc', email: 'info@techstart.com', totalBills: 8, totalAmount: '₹3,200' },
    { name: 'Global Solutions', email: 'hello@global.com', totalBills: 15, totalAmount: '₹8,900' },
    { name: 'Local Business', email: 'owner@local.com', totalBills: 5, totalAmount: '₹2,100' },
  ];

  const productsList = [
    { name: 'Web Development', price: '₹50,000', category: 'Service', stock: 'Unlimited' },
    { name: 'Mobile App', price: '₹75,000', category: 'Service', stock: 'Unlimited' },
    { name: 'Consulting Hours', price: '₹2,500', category: 'Service', stock: 'Unlimited' },
    { name: 'Software License', price: '₹15,000', category: 'Product', stock: '25' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  const handleCloseModal = () => setOpenModal(null);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-bill':
        navigate('/bills/new');
        break;
      case 'add-customer':
        navigate('/customers/new');
        break;
      case 'add-product':
        navigate('/products/new');
        break;
      case 'view-reports':
        navigate('/reports');
        break;
    }
  };

  const handleBillClick = (billId: string) => {
    setOpenModal(`bill-${billId}`);
  };

  const handleDownloadBill = (billId: string) => {
    // Implement PDF download logic
    console.log(`Downloading bill ${billId}`);
    // Create a temporary download link
    const element = document.createElement('a');
    element.href = `/api/bills/${billId}/pdf`;
    element.download = `bill-${billId}.pdf`;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShareWhatsApp = (billId: string, customer: string, amount: string) => {
    const bill = recentBills.find(b => b.id === billId);
    if (!bill) return;

    const message = `Hi ${customer}! Your bill #${billId} for ${amount} is ready. You can view and download it here: ${window.location.origin}/bills/view/${billId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewFullBill = (billId: string) => {
    // Open full bill view in new window/tab
    window.open(`/bills/view/${billId}`, '_blank');
  };

  // ... (existing imports)

  // ... (inside Dashboard component return)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom>
          Welcome back! 👋
        </Typography>
        <Typography variant={isMobile ? "body2" : "subtitle1"} color="text.secondary">
          Here's what's happening with your business today
        </Typography>
      </Box>

      {/* Inventory Alerts Widget */}
      <InventoryAlerts />

      {/* Metrics Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(6, 1fr)'
        },
        gap: 2,
        mb: 4
      }}>
        <MetricCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          change="+₹5,200 this mo"
          changeType={netProfit >= 0 ? "positive" : "negative"}
          icon={<TrendingUpIcon />}
          onClick={() => navigate('/expenses')}
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          change="-₹1,200 this mo"
          changeType="negative"
          icon={<CurrencyRupeeIcon />}
          onClick={() => navigate('/expenses')}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={revenueGrowth}
          changeType="positive"
          icon={<CurrencyRupeeIcon />}
          onClick={() => setOpenModal('revenue')}
        />
        <MetricCard
          title="Total Bills"
          value={totalBills}
          change={billsGrowth}
          changeType="positive"
          icon={<ReceiptIcon />}
          onClick={() => setOpenModal('bills')}
        />
        <MetricCard
          title="Active Customers"
          value={activeCustomers}
          change={customersGrowth}
          changeType="positive"
          icon={<PeopleIcon />}
          onClick={() => setOpenModal('customers')}
        />
        <MetricCard
          title="Products"
          value={totalProducts}
          change={productsGrowth}
          changeType="neutral"
          icon={<InventoryIcon />}
          onClick={() => setOpenModal('products')}
        />
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '2fr 1fr'
        },
        gap: 2,
        mt: 2
      }}>
        {/* Recent Bills */}
        <Paper sx={{ p: 2, height: 'fit-content' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Bills
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => navigate('/bills/new')}
            >
              Create Bill
            </Button>
          </Box>

          {/* Debug: Show bills count */}
          {recentBills.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No recent bills found. Create your first bill to see it here.
            </Typography>
          ) : (
            <List>
              {recentBills.map((bill, index) => (
                <ListItem
                  key={bill.id}
                  sx={{
                    borderBottom: index < recentBills.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    px: 0,
                    py: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                    }
                  }}
                  onClick={() => handleBillClick(bill.id)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <ReceiptIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                    {/* Primary row with bill ID and status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight="medium" noWrap>
                          Bill #{bill.id}
                        </Typography>
                        <Chip
                          label={bill.status}
                          size="small"
                          color={getStatusColor(bill.status) as any}
                          variant="outlined"
                        />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="primary"
                        sx={{
                          flexShrink: 0,
                          ml: 2,
                          display: { xs: 'none', sm: 'block' }
                        }}
                      >
                        {bill.amount}
                      </Typography>
                    </Box>

                    {/* Secondary row with customer and date */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, mr: 1 }}>
                        {bill.customer}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {bill.date}
                      </Typography>
                    </Box>

                    {/* Mobile: Amount on separate line */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        {bill.amount}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action button */}
                  <Box sx={{ flexShrink: 0, ml: 1 }}>
                    <IconButton
                      edge="end"
                      aria-label="more"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu open logic here
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 2, height: 'fit-content' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
              onClick={() => handleQuickAction('create-bill')}
            >
              Create New Bill
            </Button>
            <Button
              variant="outlined"
              startIcon={<PeopleIcon />}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
              onClick={() => handleQuickAction('add-customer')}
            >
              Add Customer
            </Button>
            <Button
              variant="outlined"
              startIcon={<InventoryIcon />}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
              onClick={() => handleQuickAction('add-product')}
            >
              Add Product
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              fullWidth
              sx={{ justifyContent: 'flex-start' }}
              onClick={() => handleQuickAction('view-reports')}
            >
              View Reports
            </Button>
            {permissions.canViewAdminPanel && (
              <Button
                variant="outlined"
                startIcon={<AdminIcon />}
                fullWidth
                sx={{
                  justifyContent: 'flex-start',
                  color: 'primary.main',
                  borderColor: 'primary.light',
                  bgcolor: 'rgba(48, 92, 222, 0.04)',
                  mt: 1
                }}
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </Button>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Revenue Breakdown Modal */}
      <Dialog open={openModal === 'revenue'} onClose={handleCloseModal} maxWidth="md" fullWidth >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Revenue Breakdown
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Source</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revenueBreakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.source}</TableCell>
                    <TableCell align="right">{item.amount}</TableCell>
                    <TableCell align="right">{item.percentage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Bills Breakdown Modal */}
      <Dialog open={openModal === 'bills'} onClose={handleCloseModal} maxWidth="md" fullWidth >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Bills Breakdown
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billsBreakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color={getStatusColor(item.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Active Customers Modal */}
      <Dialog open={openModal === 'customers'} onClose={handleCloseModal} maxWidth="md" fullWidth >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Active Customers
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Total Bills</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topActiveCustomers.map((customer: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell align="right">{customer.totalBills}</TableCell>
                    <TableCell align="right">{customer.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Products Modal */}
      <Dialog open={openModal === 'products'} onClose={handleCloseModal} maxWidth="md" fullWidth >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Products List
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <TableRow key={product.id || index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                      <TableCell align="right">{product.stock ?? 0}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No products found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Bill Preview Modals */}
      {
        recentBills.map((bill) => (
          <Dialog
            key={`bill-${bill.id}`}
            open={openModal === `bill-${bill.id}`}
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Bill #{bill.id} Preview
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Customer: {bill.customer}</Typography>
                <Typography variant="body1" gutterBottom>Amount: {bill.amount}</Typography>
                <Typography variant="body1" gutterBottom>Status: {bill.status}</Typography>
                <Typography variant="body1" gutterBottom>Date: {bill.date}</Typography>

                <Divider sx={{ my: 2 }} />

                {/* Sample bill items */}
                <Typography variant="h6" gutterBottom>Items:</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Web Development</TableCell>
                        <TableCell align="right">1</TableCell>
                        <TableCell align="right">₹2,450</TableCell>
                        <TableCell align="right">₹2,450</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </DialogContent>
            <DialogActions sx={{
              gap: 1.5,
              p: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'stretch'
            }}>
              <Button
                startIcon={<VisibilityIcon />}
                onClick={() => handleViewFullBill(bill.id)}
                variant="outlined"
                fullWidth
              >
                View Full Bill
              </Button>
              <Button
                startIcon={<WhatsAppIcon />}
                onClick={() => handleShareWhatsApp(bill.id, bill.customer, bill.amount)}
                variant="outlined"
                fullWidth
                sx={{
                  color: '#25D366',
                  borderColor: '#25D366',
                  '&:hover': {
                    borderColor: '#25D366',
                    backgroundColor: 'rgba(37, 211, 102, 0.04)'
                  }
                }}
              >
                Share
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadBill(bill.id)}
                fullWidth
              >
                PDF
              </Button>
            </DialogActions>
          </Dialog>
        ))
      }
    </Box >
  );
};

export default Dashboard;
