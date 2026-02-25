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

interface MinimalCleanPreviewProps {
  template: InvoiceTemplate;
}

/**
 * Minimal Clean Template Preview - Modern minimalist design
 */
const MinimalCleanPreview: React.FC<MinimalCleanPreviewProps> = ({ template }) => {
  const { settings } = template;

  // Sample invoice data for Minimal Clean template
  const invoiceData = {
    invoiceNumber: 'INV-2024-003',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    company: {
      name: 'Minimal Studios',
      address: '456 Design Street, Pune',
      city: 'Maharashtra 411001, India',
      phone: '+91 95432 10987',
      email: 'hello@minimalstudios.in',
      website: 'minimalstudios.in'
    },
    customer: {
      name: 'Arjun Patel',
      company: 'Tech Innovations Pvt Ltd',
      address: '789 Tech Park, Hyderabad',
      city: 'Telangana 500001, India',
      email: 'arjun@techinnovations.com'
    },
    items: [
      { description: 'Brand Identity Design', quantity: 1, rate: 95000, amount: 95000 },
      { description: 'Website UI/UX Design', quantity: 1, rate: 125000, amount: 125000 },
      { description: 'Brand Guidelines Document', quantity: 1, rate: 35000, amount: 35000 }
    ],
    subtotal: 255000,
    tax: 45900, // 18% GST
    total: 300900
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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        margin: 'auto',
        position: 'relative',
      }}
    >
      {/* Minimal Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 300,
              color: settings.colorScheme,
              mb: 0.5,
              letterSpacing: '1px'
            }}
          >
            {invoiceData.company.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {invoiceData.company.address}<br />
            {invoiceData.company.city}<br />
            {invoiceData.company.email}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              color: 'text.secondary',
              mb: 1,
              letterSpacing: '2px'
            }}
          >
            INVOICE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {invoiceData.invoiceNumber}
          </Typography>
        </Box>
      </Box>

      {/* Minimal Invoice Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            BILL TO
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            {invoiceData.customer.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {invoiceData.customer.company}<br />
            {invoiceData.customer.address}<br />
            {invoiceData.customer.city}<br />
            {invoiceData.customer.email}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right', minWidth: '150px' }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">DATE</Typography>
            <Typography variant="body2">{invoiceData.date}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">DUE DATE</Typography>
            <Typography variant="body2">{invoiceData.dueDate}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Minimal Items Table */}
      <TableContainer sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                border: 'none',
                borderBottom: `1px solid ${settings.colorScheme}`,
                py: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Description
              </TableCell>
              <TableCell align="center" sx={{
                border: 'none',
                borderBottom: `1px solid ${settings.colorScheme}`,
                py: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{
                border: 'none',
                borderBottom: `1px solid ${settings.colorScheme}`,
                py: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Rate
              </TableCell>
              <TableCell align="right" sx={{
                border: 'none',
                borderBottom: `1px solid ${settings.colorScheme}`,
                py: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell sx={{ border: 'none', py: 2, fontWeight: 400 }}>
                  {item.description}
                </TableCell>
                <TableCell align="center" sx={{ border: 'none', py: 2 }}>
                  {item.quantity}
                </TableCell>
                <TableCell align="right" sx={{ border: 'none', py: 2 }}>
                  ₹{item.rate.toLocaleString('en-IN')}
                </TableCell>
                <TableCell align="right" sx={{ border: 'none', py: 2, fontWeight: 500 }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Minimal Totals */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 6 }}>
        <Box sx={{ width: '250px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="body2" color="text.secondary">SUBTOTAL</Typography>
            <Typography variant="body2">₹{invoiceData.subtotal.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="body2" color="text.secondary">GST (18%)</Typography>
            <Typography variant="body2">₹{invoiceData.tax.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2, borderBottom: `2px solid ${settings.colorScheme}` }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: settings.colorScheme }}>
              TOTAL
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: settings.colorScheme }}>
              ₹{invoiceData.total.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Template Fields Display */}
      <Box sx={{
        mb: 6,
        '@media print': {
          display: 'none !important'
        }
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
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
              border: '1px solid #f0f0f0',
              borderRadius: 0.5,
              backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: settings.colorScheme }}>
                {field.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {field.type} • {field.required ? 'Required' : 'Optional'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Minimal Footer */}
      <Box sx={{
        mt: 'auto',
        pt: 4,
        borderTop: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Payment due within 30 days
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

export default MinimalCleanPreview;
