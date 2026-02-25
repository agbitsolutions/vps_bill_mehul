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

interface CreativeModernPreviewProps {
  template: InvoiceTemplate;
}

/**
 * Creative Modern Template Preview - Contemporary creative design with gradients
 */
const CreativeModernPreview: React.FC<CreativeModernPreviewProps> = ({ template }) => {
  const { settings } = template;

  // Sample invoice data for Creative Modern template
  const invoiceData = {
    invoiceNumber: 'CM-2024-005',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    company: {
      name: 'Creative Design Studio',
      address: 'Design Hub, Koramangala, Bangalore',
      city: 'Karnataka 560034, India',
      phone: '+91 89765 43210',
      email: 'studio@creativedesign.in',
      website: 'creativedesign.in'
    },
    customer: {
      name: 'Meera Krishnan',
      company: 'Startup Ventures Ltd',
      address: '234 Innovation Street, Kochi',
      city: 'Kerala 682001, India',
      email: 'meera@startupventures.com'
    },
    items: [
      { description: 'Creative Logo Design Package', quantity: 1, rate: 65000, amount: 65000 },
      { description: 'Social Media Design Kit', quantity: 1, rate: 45000, amount: 45000 },
      { description: 'Branding Collateral Design', quantity: 1, rate: 85000, amount: 85000 },
      { description: 'Motion Graphics Video', quantity: 2, rate: 55000, amount: 110000 }
    ],
    subtotal: 305000,
    tax: 54900, // 18% GST
    total: 359900
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
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        margin: 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Creative Header with Gradient */}
      <Box sx={{
        background: `linear-gradient(135deg, ${settings.colorScheme} 0%, ${settings.colorScheme}80 50%, ${settings.colorScheme}60 100%)`,
        color: 'white',
        p: 4,
        mb: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="rgba(255,255,255,0.1)" fill-rule="evenodd"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {invoiceData.company.name.charAt(0)}
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, letterSpacing: '1px' }}>
                {invoiceData.company.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 0.5 }}>
                {invoiceData.company.address}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {invoiceData.company.city}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  letterSpacing: '2px'
                }}
              >
                INVOICE
              </Typography>
              <Box sx={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                p: 1.5,
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {invoiceData.invoiceNumber}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Creative Contact Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 4 }}>
        <Paper sx={{
          p: 2,
          borderRadius: '12px',
          background: `linear-gradient(45deg, ${settings.colorScheme}10, ${settings.colorScheme}05)`,
          border: `2px solid ${settings.colorScheme}20`
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 0.5 }}>
            📞 PHONE
          </Typography>
          <Typography variant="body2">{invoiceData.company.phone}</Typography>
        </Paper>
        <Paper sx={{
          p: 2,
          borderRadius: '12px',
          background: `linear-gradient(45deg, ${settings.colorScheme}10, ${settings.colorScheme}05)`,
          border: `2px solid ${settings.colorScheme}20`
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 0.5 }}>
            ✉️ EMAIL
          </Typography>
          <Typography variant="body2">{invoiceData.company.email}</Typography>
        </Paper>
        <Paper sx={{
          p: 2,
          borderRadius: '12px',
          background: `linear-gradient(45deg, ${settings.colorScheme}10, ${settings.colorScheme}05)`,
          border: `2px solid ${settings.colorScheme}20`
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 0.5 }}>
            🌐 WEBSITE
          </Typography>
          <Typography variant="body2">{invoiceData.company.website}</Typography>
        </Paper>
      </Box>

      {/* Creative Invoice Details */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
        {/* Invoice Info */}
        <Paper sx={{
          p: 3,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${settings.colorScheme}15, ${settings.colorScheme}05)`,
          border: `1px solid ${settings.colorScheme}30`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            📋 Invoice Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date:</Typography>
            <Typography variant="body2">{invoiceData.date}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Due:</Typography>
            <Typography variant="body2">{invoiceData.dueDate}</Typography>
          </Box>
        </Paper>

        {/* Customer Info */}
        <Paper sx={{
          p: 3,
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${settings.colorScheme}15, ${settings.colorScheme}05)`,
          border: `1px solid ${settings.colorScheme}30`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            👤 Client Details
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {invoiceData.customer.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{invoiceData.customer.company}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{invoiceData.customer.address}</Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{invoiceData.customer.city}</Typography>
          <Typography variant="body2">{invoiceData.customer.email}</Typography>
        </Paper>
      </Box>

      {/* Creative Items Table */}
      <TableContainer
        component={Paper}
        sx={{
          mb: 4,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: `0 4px 12px ${settings.colorScheme}20`
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{
              background: `linear-gradient(135deg, ${settings.colorScheme}, ${settings.colorScheme}80)`
            }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                🎨 Creative Services
              </TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Qty
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Rate
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.items.map((item, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(even)': {
                    backgroundColor: `${settings.colorScheme}08`
                  },
                  '&:hover': {
                    backgroundColor: `${settings.colorScheme}15`,
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 'medium', py: 2 }}>
                  {item.description}
                </TableCell>
                <TableCell align="center" sx={{ py: 2 }}>
                  {item.quantity}
                </TableCell>
                <TableCell align="right" sx={{ py: 2 }}>
                  ₹{item.rate.toLocaleString('en-IN')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', py: 2, color: settings.colorScheme }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Creative Totals */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Paper sx={{
          p: 3,
          width: '320px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${settings.colorScheme}10, ${settings.colorScheme}05)`,
          border: `2px solid ${settings.colorScheme}30`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 2 }}>
            💰 Payment Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">₹{invoiceData.subtotal.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">GST (18%):</Typography>
            <Typography variant="body1">₹{invoiceData.tax.toLocaleString('en-IN')}</Typography>
          </Box>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            background: `linear-gradient(135deg, ${settings.colorScheme}, ${settings.colorScheme}80)`,
            color: 'white',
            borderRadius: '12px',
            mt: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total:
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
          🎛️ Template Configuration
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2
        }}>
          {template.fields.filter(field => field.visible).map((field, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                borderRadius: '12px',
                background: `linear-gradient(45deg, ${settings.colorScheme}10, ${settings.colorScheme}05)`,
                border: `1px solid ${settings.colorScheme}20`,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${settings.colorScheme}20`
                }
              }}
            >
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

      {/* Creative Footer */}
      <Box sx={{
        mt: 'auto',
        p: 3,
        background: `linear-gradient(135deg, ${settings.colorScheme}15, ${settings.colorScheme}05)`,
        borderRadius: '16px',
        textAlign: 'center',
        border: `1px solid ${settings.colorScheme}30`
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.colorScheme, mb: 1 }}>
          🎨 Creative Payment Terms
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Payment due within 30 days. Late fees may apply. Thank you for choosing our creative services!
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Generated using {template.name} Template • Designed with ❤️
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

export default CreativeModernPreview;
