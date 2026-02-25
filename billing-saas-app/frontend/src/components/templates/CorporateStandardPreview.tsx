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
  Grid,
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

interface CorporateStandardPreviewProps {
  template: InvoiceTemplate;
}

/**
 * Corporate Standard Template Preview - Professional corporate layout
 */
const CorporateStandardPreview: React.FC<CorporateStandardPreviewProps> = ({ template }) => {
  const { settings } = template;

  // Sample invoice data for Corporate Standard template
  const invoiceData = {
    invoiceNumber: 'CS-INV-2024-004',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    company: {
      name: 'Corporate Solutions India Ltd',
      address: '12th Floor, Business Tower, Gurgaon',
      city: 'Haryana 122002, India',
      phone: '+91 93456 78901',
      email: 'billing@corporatesolutions.in',
      website: 'www.corporatesolutions.in',
      gst: 'GST06ABCDE1234F5Z6'
    },
    customer: {
      name: 'Sanjay Gupta',
      company: 'Future Technologies Ltd',
      address: '567 IT Park, Chennai',
      city: 'Tamil Nadu 600001, India',
      email: 'sanjay@futuretech.com',
      gst: 'GST33XYZPQ9876R2S1'
    },
    items: [
      { description: 'Enterprise Software License', quantity: 5, rate: 25000, amount: 125000 },
      { description: 'Implementation Services', quantity: 1, rate: 150000, amount: 150000 },
      { description: 'Training & Support (Annual)', quantity: 1, rate: 85000, amount: 85000 },
      { description: 'Custom Integration Module', quantity: 2, rate: 40000, amount: 80000 }
    ],
    subtotal: 440000,
    tax: 79200, // 18% GST
    total: 519200
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
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        margin: 'auto',
        position: 'relative',
      }}
    >
      {/* Corporate Header with Logo Area */}
      <Box sx={{
        backgroundColor: settings.colorScheme,
        color: 'white',
        p: 3,
        mb: 3,
        borderRadius: '4px 4px 0 0'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Box sx={{
              width: 60,
              height: 60,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                {invoiceData.company.name.charAt(0)}
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {invoiceData.company.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {invoiceData.company.address}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {invoiceData.company.city}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              INVOICE
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              GST: {invoiceData.company.gst}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Corporate Contact Info */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: 'grey.50',
        borderRadius: 1
      }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            PHONE
          </Typography>
          <Typography variant="body2">{invoiceData.company.phone}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            EMAIL
          </Typography>
          <Typography variant="body2">{invoiceData.company.email}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            WEBSITE
          </Typography>
          <Typography variant="body2">{invoiceData.company.website}</Typography>
        </Box>
      </Box>

      {/* Invoice Details and Customer Info */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 4 }}>
        {/* Invoice Details */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            Invoice Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Number:</Typography>
            <Typography variant="body2">{invoiceData.invoiceNumber}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date:</Typography>
            <Typography variant="body2">{invoiceData.date}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Due Date:</Typography>
            <Typography variant="body2">{invoiceData.dueDate}</Typography>
          </Box>
        </Paper>

        {/* Customer Information */}
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            Customer Details
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {invoiceData.customer.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{invoiceData.customer.company}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{invoiceData.customer.address}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{invoiceData.customer.city}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{invoiceData.customer.email}</Typography>
          <Typography variant="body2" color="text.secondary">GST: {invoiceData.customer.gst}</Typography>
        </Paper>
      </Box>

      {/* Corporate Items Table */}
      <TableContainer component={Paper} sx={{ mb: 4, border: `1px solid ${settings.colorScheme}30` }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: `${settings.colorScheme}15` }}>
              <TableCell sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Description
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Quantity
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Rate (₹)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                Amount (₹)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(even)': { backgroundColor: 'grey.25' },
                  '&:hover': { backgroundColor: `${settings.colorScheme}10` }
                }}
              >
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

      {/* Corporate Totals Section */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Paper sx={{ p: 3, width: '350px', border: `1px solid ${settings.colorScheme}30` }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            Invoice Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              ₹{invoiceData.subtotal.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">GST (18%):</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              ₹{invoiceData.tax.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: settings.colorScheme,
            color: 'white',
            borderRadius: 1,
            mt: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total Amount:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ₹{invoiceData.total.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Paper>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 2
        }}>
          {template.fields.filter(field => field.visible).map((field, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                border: `1px solid ${settings.colorScheme}30`,
                backgroundColor: 'grey.50'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: settings.colorScheme }}>
                {field.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Type: {field.type} • {field.required ? 'Required' : 'Optional'}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Corporate Footer */}
      <Box sx={{
        mt: 'auto',
        p: 3,
        backgroundColor: settings.colorScheme,
        color: 'white',
        textAlign: 'center',
        borderRadius: '0 0 4px 4px'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Terms & Conditions
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
          Payment is due within 30 days from invoice date. Interest @ 2% per month will be charged on overdue amounts.
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
          All disputes are subject to Delhi jurisdiction only.
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Generated using {template.name} Template • Powered by BillSoft
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

export default CorporateStandardPreview;
