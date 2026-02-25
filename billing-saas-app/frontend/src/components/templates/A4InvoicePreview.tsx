import React from 'react';
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
import { QRCodeSVG } from 'qrcode.react';

import { Bill } from '../../types/bill';

interface A4InvoicePreviewProps {
  template: {
    id: string;
    name: string;
    settings: {
      logoPosition: 'top-left' | 'top-center' | 'top-right';
      colorScheme: string;
      fontFamily: string;
      fontSize: number;
      showBorder: boolean;
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
    };
  };
  bill?: Bill;
}

/**
 * A4InvoicePreview component renders a realistic A4 invoice preview
 * Shows actual layout with proper dimensions and styling
 */
const A4InvoicePreview: React.FC<A4InvoicePreviewProps> = ({ template, bill }) => {
  const { settings } = template;

  // Sample invoice data or real bill data
  const invoiceData = bill ? {
    invoiceNumber: bill.billNumber || bill.id.slice(0, 8).toUpperCase(),
    date: new Date(bill.createdAt).toLocaleDateString(),
    dueDate: new Date(bill.dueDate).toLocaleDateString(),
    company: {
      name: bill.supplier?.name || 'BillSoft Inc.',
      address: bill.supplier?.address || '123 Business District, Mumbai',
      city: bill.supplier?.address ? '' : 'Maharashtra 400001, India',
      phone: bill.supplier?.phone || '+91 98765 43210',
      email: bill.supplier?.email || 'billing@billsoft.in',
      website: 'www.billsoft.in'
    },
    customer: {
      name: bill.customerName,
      company: 'Client',
      address: 'Customer Address',
      city: '',
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
    invoiceNumber: 'INV-2024-001',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    company: {
      name: 'TechSolutions India Pvt Ltd',
      address: '123 Business District, Mumbai',
      city: 'Maharashtra 400001, India',
      phone: '+91 98765 43210',
      email: 'billing@techsolutions.in',
      website: 'www.techsolutions.in'
    },
    customer: {
      name: 'Rajesh Kumar',
      company: 'Global Enterprises Ltd',
      address: '456 Corporate Park, Bangalore',
      city: 'Karnataka 560001, India',
      email: 'rajesh@globalenterprises.com'
    },
    items: [
      { description: 'Web Development Services', quantity: 1, rate: 85000, amount: 85000 },
      { description: 'Mobile App Development', quantity: 1, rate: 120000, amount: 120000 },
      { description: 'UI/UX Design Package', quantity: 1, rate: 45000, amount: 45000 },
      { description: 'Digital Marketing Setup', quantity: 1, rate: 35000, amount: 35000 }
    ],
    subtotal: 285000,
    tax: 51300, // 18% GST
    total: 336300
  };

  const logoAlignment =
    settings.logoPosition === 'top-center' ? 'center' :
      settings.logoPosition === 'top-right' ? 'flex-end' : 'flex-start';

  return (
    <Paper
      sx={{
        width: { xs: '100%', sm: '100%', md: '210mm' }, // Responsive: full width on mobile, A4 on desktop
        minHeight: { xs: 'auto', md: '297mm' }, // Auto height on mobile, A4 height on desktop
        maxWidth: '100%',
        margin: '0 auto',
        backgroundColor: 'white',
        border: settings.showBorder ? '2px solid #e0e0e0' : 'none',
        fontFamily: settings.fontFamily,
        fontSize: { xs: `${settings.fontSize - 2}px`, md: `${settings.fontSize}px` }, // Slightly smaller font on mobile
        lineHeight: 1.4,
        p: {
          xs: 2, // Smaller padding on mobile
          md: `${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm`
        },
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        overflow: { xs: 'visible', md: 'hidden' },
        '@media print': {
          boxShadow: 'none',
          border: 'none',
          width: '210mm',
          minHeight: '290mm', // Slightly less than A4 to prevent overflow
          height: '290mm',
          overflow: 'hidden',
          m: 0,
          p: `${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm`,
          fontSize: `${settings.fontSize}px`,
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        {/* Logo and Company Info */}
        <Box sx={{
          display: 'flex',
          justifyContent: logoAlignment,
          alignItems: 'center',
          mb: 3
        }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              backgroundColor: settings.colorScheme,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              mr: settings.logoPosition === 'top-left' ? 2 : 0,
              ml: settings.logoPosition === 'top-right' ? 2 : 0,
            }}
          >
            {invoiceData.company.name.charAt(0)}
          </Box>
          {settings.logoPosition === 'top-left' && (
            <Box>
              <Typography variant="h5" fontWeight="bold" color={settings.colorScheme}>
                {invoiceData.company.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Professional Invoice Template
              </Typography>
            </Box>
          )}
        </Box>

        {/* Invoice Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            color={settings.colorScheme}
            sx={{ mb: 1 }}
          >
            INVOICE
          </Typography>
          <Box sx={{
            height: 3,
            backgroundColor: settings.colorScheme,
            width: 100,
            mx: 'auto',
            mb: 2
          }} />
        </Box>

        {/* Invoice Details and Company Info Row */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, // Stack on mobile, side-by-side on desktop
          gap: 4,
          mb: 3
        }}>
          {/* Invoice Details */}
          <Box>
            <Typography variant="h6" fontWeight="bold" color={settings.colorScheme} gutterBottom>
              Invoice Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">Invoice #:</Typography>
              <Typography variant="body2">{invoiceData.invoiceNumber}</Typography>

              <Typography variant="body2" fontWeight="bold">Date:</Typography>
              <Typography variant="body2">{invoiceData.date}</Typography>

              <Typography variant="body2" fontWeight="bold">Due Date:</Typography>
              <Typography variant="body2">{invoiceData.dueDate}</Typography>
            </Box>
          </Box>

          {/* Company Information */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" fontWeight="bold" color={settings.colorScheme} gutterBottom>
              {invoiceData.company.name}
            </Typography>
            <Typography variant="body2">{invoiceData.company.address}</Typography>
            <Typography variant="body2">{invoiceData.company.city}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Phone: {invoiceData.company.phone}
            </Typography>
            <Typography variant="body2">
              Email: {invoiceData.company.email}
            </Typography>
            <Typography variant="body2">
              Web: {invoiceData.company.website}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Bill To Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" color={settings.colorScheme} gutterBottom>
          Bill To:
        </Typography>
        <Paper sx={{ p: 2, backgroundColor: 'grey.50', border: `1px solid ${settings.colorScheme}20` }}>
          <Typography variant="body1" fontWeight="bold">
            {invoiceData.customer.name}
          </Typography>
          <Typography variant="body2">{invoiceData.customer.company}</Typography>
          <Typography variant="body2">{invoiceData.customer.address}</Typography>
          <Typography variant="body2">{invoiceData.customer.city}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Email: {invoiceData.customer.email}
          </Typography>
        </Paper>
      </Box>

      {/* Items Table */}
      <TableContainer
        component={Paper}
        sx={{
          mb: 3,
          border: `1px solid ${settings.colorScheme}30`,
          overflowX: 'auto', // Enable horizontal scroll on mobile
          '@media print': {
            overflowX: 'visible'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: `${settings.colorScheme}10` }}>
              <TableCell sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Description
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Rate
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: 'grey.50' } }}>
                <TableCell>{item.description}</TableCell>
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

      {/* Totals Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap-reverse', gap: 4 }}>
        {/* UPI QR Code */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, border: '1px dashed #ccc', borderRadius: 2 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom>Scan to Pay via UPI</Typography>
          <QRCodeSVG
            value={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_VPA || 'merchant@upi'}&pn=${encodeURIComponent(invoiceData.company.name)}&am=${invoiceData.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Payment for ${invoiceData.invoiceNumber}`)}`}
            size={100}
            level="M"
          />
          <Typography variant="caption" sx={{ mt: 0.5 }}>All UPI Apps Supported</Typography>
        </Box>

        <Box sx={{ minWidth: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">₹{invoiceData.subtotal.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">GST (18%):</Typography>
            <Typography variant="body1">₹{invoiceData.tax.toLocaleString('en-IN')}</Typography>
          </Box>
          <Divider sx={{ my: 1, borderColor: settings.colorScheme }} />
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: `${settings.colorScheme}10`,
            borderRadius: 1,
            border: `2px solid ${settings.colorScheme}`
          }}>
            <Typography variant="h6" fontWeight="bold" color={settings.colorScheme}>
              Total:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={settings.colorScheme}>
              ₹{invoiceData.total.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Payment Terms */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" color={settings.colorScheme} gutterBottom>
          Payment Terms
        </Typography>
        <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Typography variant="body2" paragraph>
            • Payment is due within 30 days of invoice date
          </Typography>
          <Typography variant="body2" paragraph>
            • Late payments may incur a 1.5% monthly service charge
          </Typography>
          <Typography variant="body2" paragraph>
            • Please include invoice number with payment
          </Typography>
          <Typography variant="body2">
            • For questions about this invoice, contact us at {invoiceData.company.email}
          </Typography>
        </Paper>
      </Box>

      {/* Footer */}
      <Box sx={{
        textAlign: 'center',
        pt: 2,
        borderTop: `2px solid ${settings.colorScheme}`,
        mt: 'auto'
      }}>
        <Typography variant="body2" color="text.secondary">
          Thank you for your business!
        </Typography>
        <Typography variant="caption" color="text.secondary">
          This invoice was generated using {template.name} template
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

export default A4InvoicePreview;
