import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatCurrency } from '../utils/currency';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Reports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('last30');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Sample data for charts
  const monthlyRevenue = [
    { month: 'Jan', revenue: 24000, bills: 45 },
    { month: 'Feb', revenue: 28000, bills: 52 },
    { month: 'Mar', revenue: 32000, bills: 61 },
    { month: 'Apr', revenue: 29000, bills: 55 },
    { month: 'May', revenue: 35000, bills: 68 },
    { month: 'Jun', revenue: 42000, bills: 78 },
  ];

  const billStatusData = [
    { name: 'Paid', value: 65, color: '#4caf50' },
    { name: 'Pending', value: 25, color: '#ff9800' },
    { name: 'Overdue', value: 8, color: '#f44336' },
    { name: 'Draft', value: 2, color: '#9e9e9e' },
  ];

  const topCustomers = [
    { name: 'Acme Corp', revenue: '₹85,400', bills: 24, growth: '+12%' },
    { name: 'TechStart Inc', revenue: '₹72,100', bills: 18, growth: '+8%' },
    { name: 'Global Solutions', revenue: '₹63,800', bills: 21, growth: '+15%' },
    { name: 'Innovation Labs', revenue: '₹58,200', bills: 16, growth: '+5%' },
    { name: 'Future Systems', revenue: '₹45,900', bills: 13, growth: '+22%' },
  ];

  const topProducts = [
    { name: 'Web Development', revenue: '₹125,000', quantity: 15, category: 'Service' },
    { name: 'Mobile App Development', revenue: '₹98,500', quantity: 8, category: 'Service' },
    { name: 'Consulting Hours', revenue: '₹76,200', quantity: 42, category: 'Service' },
    { name: 'Software License', revenue: '₹45,800', quantity: 12, category: 'Product' },
    { name: 'Support Package', revenue: '₹32,400', quantity: 18, category: 'Service' },
  ];

  const handleExportReport = (reportType: string) => {
    console.log(`Exporting ${reportType} report...`);
    // Implement export functionality
  };

  const handleGSTExport = async (format: 'excel' | 'json') => {
    try {
      const token = localStorage.getItem('token');

      // Calculate date range based on selection
      let startDate, endDate;
      const today = new Date();

      switch (dateRange) {
        case 'last7':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = today;
          break;
        case 'last30':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = today;
          break;
        case 'last90':
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          endDate = today;
          break;
        case 'last12':
          startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
          endDate = today;
          break;
        default:
          // Default to current financial year (April 1 to March 31)
          const currentYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
          startDate = new Date(currentYear, 3, 1); // April 1
          endDate = today;
      }

      const response = await fetch('/api/reports/gst-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate GST report');
      }

      if (format === 'excel') {
        // Download Excel file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GST_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON file
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GST_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      console.log('GST report exported successfully');
    } catch (error) {
      console.error('Error exporting GST report:', error);
      alert('Failed to export GST report. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive insights into your business performance
        </Typography>
      </Box>

      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            select
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="last7">Last 7 days</MenuItem>
            <MenuItem value="last30">Last 30 days</MenuItem>
            <MenuItem value="last90">Last 90 days</MenuItem>
            <MenuItem value="last12">Last 12 months</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportReport('comprehensive')}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={async () => {
              const token = localStorage.getItem('token');
              const res = await fetch('/api/reports/gst-export', { headers: { Authorization: `Bearer ${token}` } });
              const data = await res.json();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `gst_export_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
          >
            Export for CA (GST)
          </Button>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  ₹2,45,670
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    +15.2%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ReceiptIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  456
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Bills
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    +8.4%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  127
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Customers
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    +5.8%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DateRangeIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  ₹5,420
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Bill Value
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                  <Typography variant="caption" color="error.main">
                    -2.1%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Revenue Analytics" />
          <Tab label="Customer Insights" />
          <Tab label="Product Performance" />
          <Tab label="Bill Status Analysis" />
        </Tabs>

        {/* Revenue Analytics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value) || 0), 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#1976d2" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bill Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={billStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {billStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Customer Insights Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Customers by Revenue
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer Name</TableCell>
                      <TableCell align="right">Total Revenue</TableCell>
                      <TableCell align="right">Total Bills</TableCell>
                      <TableCell align="right">Growth Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell align="right">{customer.revenue}</TableCell>
                        <TableCell align="right">{customer.bills}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={customer.growth}
                            color={customer.growth.startsWith('+') ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Product Performance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Products by Revenue
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Quantity Sold</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Chip label={product.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{product.revenue}</TableCell>
                        <TableCell align="right">{product.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Bill Status Analysis Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bills by Status
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {billStatusData.map((status, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{status.name}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {status.value}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 8,
                          backgroundColor: 'grey.200',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${status.value}%`,
                            height: '100%',
                            backgroundColor: status.color,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Collection Metrics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Average Collection Time
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      12.5 days
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Collection Rate
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      94.2%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Outstanding Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      ₹45,280
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Reports;
