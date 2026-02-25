import React from 'react';
import { Bill } from '../../types/bill';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';

interface TemplateSettings {
  colorScheme: string;
  fontFamily: string;
  fontSize: number;
  logoPosition: string;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  settings: TemplateSettings;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    visible: boolean;
  }>;
}



interface ClassicProfessionalPreviewProps {
  template: InvoiceTemplate;
  bill?: Bill;
}

/**
 * Classic Professional Template Preview - Traditional formal business style
 */
const ClassicProfessionalPreview: React.FC<ClassicProfessionalPreviewProps> = ({ template, bill }) => {
  const { settings } = template;

  // Sample invoice data or real bill data
  const invoiceData = bill ? {
    invoiceNumber: bill.billNumber || bill.id.slice(0, 8).toUpperCase(),
    date: new Date(bill.createdAt).toLocaleDateString(),
    dueDate: new Date(bill.dueDate).toLocaleDateString(),
    company: {
      name: bill.supplier?.name || 'BillSoft Jaipur',
      address: bill.supplier?.address || '123 Main Street, Jaipur',
      city: bill.supplier?.address ? '' : 'Rajasthan 302001, India',
      phone: bill.supplier?.phone || '+91 94567 89012',
      email: bill.supplier?.email || 'contact@billsoft.in',
      website: 'billsoft.in'
    },
    customer: {
      name: bill.customerName,
      company: 'Elite Manufacturing Co',
      address: '321 Industrial Area, Gurgaon',
      city: 'Haryana 122001, India',
      email: bill.customerEmail || ''
    },
    items: bill.items.map(item => ({
      description: item.productName,
      quantity: item.quantity,
      rate: item.price,
      amount: item.total
    })),
    subtotal: bill.subtotal,
    tax: bill.taxAmount,
    total: bill.totalAmount
  } : {
    invoiceNumber: 'INV-2024-002',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    company: {
      name: 'Classic Business Solutions Ltd',
      address: '789 Corporate Plaza, Delhi',
      city: 'New Delhi 110001, India',
      phone: '+91 99887 76543',
      email: 'accounts@classicbusiness.in',
      website: 'www.classicbusiness.in'
    },
    customer: {
      name: 'Priya Sharma',
      company: 'Elite Manufacturing Co',
      address: '321 Industrial Area, Gurgaon',
      city: 'Haryana 122001, India',
      email: 'priya@elitemanufacturing.com'
    },
    items: [
      { description: 'Business Consulting Services', quantity: 1, rate: 75000, amount: 75000 },
      { description: 'Financial Analysis Report', quantity: 1, rate: 45000, amount: 45000 },
      { description: 'Strategic Planning Workshop', quantity: 1, rate: 65000, amount: 65000 }
    ],
    subtotal: 185000,
    tax: 33300, // 18% GST
    total: 218300
  };

  return (
    <Paper
      sx={{
        width: { xs: '100%', sm: '100%', md: '210mm' }, // Responsive: full width on mobile, A4 on desktop
        minHeight: { xs: 'auto', md: '297mm' }, // Auto height on mobile, A4 height on desktop
        fontFamily: settings.fontFamily,
        fontSize: { xs: `${settings.fontSize - 2}px`, md: `${settings.fontSize}px` }, // Slightly smaller font on mobile
        backgroundColor: 'white',
        p: {
          xs: 2, // Smaller padding on mobile
          md: `${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm`
        },
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        margin: 'auto',
        position: 'relative',
        maxWidth: '100%',
        '@media print': {
          boxShadow: 'none',
          border: 'none',
          width: '210mm',
          minHeight: '290mm',
          height: '290mm',
          overflow: 'hidden',
          m: 0,
          p: `${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm`,
          fontSize: `${settings.fontSize}px`,
        },
      }}
    >
      {/* Classic Header with Company Info */}
      <Box sx={{
        textAlign: 'center',
        mb: 4,
        pb: 2,
        borderBottom: `3px solid ${settings.colorScheme}`
      }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: settings.colorScheme,
            mb: 1,
            letterSpacing: '2px'
          }}
        >
          {invoiceData.company.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {invoiceData.company.address}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {invoiceData.company.city}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Typography variant="body2">Phone: {invoiceData.company.phone}</Typography>
          <Typography variant="body2">Email: {invoiceData.company.email}</Typography>
          <Typography variant="body2">Web: {invoiceData.company.website}</Typography>
        </Box>
      </Box>

      {/* Invoice Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: settings.colorScheme,
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}
        >
          INVOICE
        </Typography>
      </Box>

      {/* Invoice Details and Customer Info in Classic Layout */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, // Stack on mobile, side-by-side on desktop
        gap: 4,
        mb: 4
      }}>
        {/* Invoice Details */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            Invoice Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Invoice No:</Typography>
            <Typography variant="body2">{invoiceData.invoiceNumber}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date:</Typography>
            <Typography variant="body2">{invoiceData.date}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Due Date:</Typography>
            <Typography variant="body2">{invoiceData.dueDate}</Typography>
          </Box>
        </Box>

        {/* Customer Information */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            Bill To
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {invoiceData.customer.name}
          </Typography>
          <Typography variant="body2">{invoiceData.customer.company}</Typography>
          <Typography variant="body2">{invoiceData.customer.address}</Typography>
          <Typography variant="body2">{invoiceData.customer.city}</Typography>
          <Typography variant="body2">{invoiceData.customer.email}</Typography>
        </Box>
      </Box>

      {/* Items Table - Classic Professional Style */}
      <TableContainer
        component={Paper}
        sx={{
          mb: 3,
          border: `2px solid ${settings.colorScheme}`,
          overflowX: 'auto', // Enable horizontal scroll on mobile
          '@media print': {
            overflowX: 'visible'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: settings.colorScheme }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Qty</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Rate</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: 'grey.50' } }}>
                <TableCell sx={{ fontWeight: 'medium' }}>{item.description}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">₹{item.rate.toLocaleString('en-IN')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totals Section - Classic Professional Layout */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Box sx={{ width: '300px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">₹{invoiceData.subtotal.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">GST (18%):</Typography>
            <Typography variant="body1">₹{invoiceData.tax.toLocaleString('en-IN')}</Typography>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: settings.colorScheme,
            color: 'white',
            borderRadius: 1
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total Amount:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ₹{invoiceData.total.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Template Fields Display */}
      <Box sx={{
        mb: 4,
        '@media print': {
          display: 'none !important'
        }
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
          Template Configuration
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2
        }}>
          {template.fields.filter(field => field.visible).map((field, index) => (
            <Paper key={index} sx={{ p: 1.5, backgroundColor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                {field.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {field.type} • {field.required ? 'Required' : 'Optional'}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Classic Footer */}
      <Box sx={{
        mt: 'auto',
        pt: 3,
        borderTop: `2px solid ${settings.colorScheme}`,
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 1 }}>
          Payment Terms & Conditions
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Payment is due within 30 days of invoice date. Late payments may incur additional charges.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Thank you for choosing our professional services.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Generated using {template.name} Template
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mt: 1,
            '@media print': {
              '&::after': {
                content: '"Page " counter(page) " of " counter(pages)',
              }
            },
            '@media screen': {
              '&::after': {
                content: '"Page 1"',
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default ClassicProfessionalPreview;
