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


interface SimpleBasicPreviewProps {
  template: InvoiceTemplate;
  bill?: Bill;
}

/**
 * Simple Basic Template Preview - Clean and straightforward layout
 */
const SimpleBasicPreview: React.FC<SimpleBasicPreviewProps> = ({ template, bill }) => {
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
      company: 'Local Partner',
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
    invoiceNumber: 'SB-2024-006',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    company: {
      name: 'Simple Services',
      address: '123 Main Street, Jaipur',
      city: 'Rajasthan 302001, India',
      phone: '+91 94567 89012',
      email: 'contact@simpleservices.in',
      website: 'simpleservices.in'
    },
    customer: {
      name: 'Vikram Singh',
      company: 'Local Business Co',
      address: '456 Market Road, Udaipur',
      city: 'Rajasthan 313001, India',
      email: 'vikram@localbusiness.com'
    },
    items: [
      { description: 'Consultation Services', quantity: 4, rate: 2500, amount: 10000 },
      { description: 'Document Preparation', quantity: 2, rate: 1500, amount: 3000 },
      { description: 'Basic Support Package', quantity: 1, rate: 5000, amount: 5000 }
    ],
    subtotal: 18000,
    tax: 3240, // 18% GST
    total: 21240
  };

  return (
    <Paper
      sx={{
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
        backgroundColor: 'white',
        p: `${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        margin: 'auto',
        position: 'relative',
        '@media print': {
          boxShadow: 'none',
          border: 'none',
          minHeight: '290mm',
          height: '290mm',
          overflow: 'hidden',
          m: 0,
        },
      }}
    >
      {/* Simple Header */}
      <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: '2px solid #000' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'black',
            mb: 1
          }}
        >
          {invoiceData.company.name}
        </Typography>
        <Typography variant="body1">
          {invoiceData.company.address}
        </Typography>
        <Typography variant="body1">
          {invoiceData.company.city}
        </Typography>
        <Typography variant="body1">
          Phone: {invoiceData.company.phone} | Email: {invoiceData.company.email}
        </Typography>
      </Box>

      {/* Simple Invoice Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            textDecoration: 'underline'
          }}
        >
          INVOICE
        </Typography>
      </Box>

      {/* Simple Invoice Details */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Invoice Number: {invoiceData.invoiceNumber}
            </Typography>
            <Typography variant="body1">
              Date: {invoiceData.date}
            </Typography>
            <Typography variant="body1">
              Due Date: {invoiceData.dueDate}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bill To:
          </Typography>
          <Typography variant="body1">{invoiceData.customer.name}</Typography>
          <Typography variant="body1">{invoiceData.customer.company}</Typography>
          <Typography variant="body1">{invoiceData.customer.address}</Typography>
          <Typography variant="body1">{invoiceData.customer.city}</Typography>
          <Typography variant="body1">{invoiceData.customer.email}</Typography>
        </Box>
      </Box>

      {/* Simple Items Table */}
      <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid #000' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>
                Description
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #000' }}>
                Quantity
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #000' }}>
                Rate (₹)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #000' }}>
                Amount (₹)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell sx={{ border: '1px solid #000' }}>
                  {item.description}
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  {item.quantity}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #000' }}>
                  ₹{item.rate.toLocaleString('en-IN')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #000' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Simple Totals */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Box sx={{ width: '250px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">₹{invoiceData.subtotal.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">GST (18%):</Typography>
            <Typography variant="body1">₹{invoiceData.tax.toLocaleString('en-IN')}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Total Amount:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textDecoration: 'underline' }}>
          Template Configuration
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 1.5
        }}>
          {template.fields.filter(field => field.visible).map((field, index) => (
            <Box key={index} sx={{
              p: 1.5,
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {field.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {field.type} • {field.required ? 'Required' : 'Optional'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Simple Footer */}
      <Box sx={{
        mt: 'auto',
        pt: 3,
        borderTop: '2px solid #000',
        textAlign: 'center'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Payment Terms
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Payment is due within 30 days of invoice date.
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Thank you for your business!
        </Typography>
        <Typography variant="caption" color="text.secondary">
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

export default SimpleBasicPreview;
