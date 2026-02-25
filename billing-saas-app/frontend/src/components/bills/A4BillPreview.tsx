import React, { forwardRef, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
  IconButton,
  Grid
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BillPreview, TemplateComplexity } from '../../types/billTemplate';

interface A4BillPreviewProps {
  billData: BillPreview;
  templateComplexity: TemplateComplexity;
  showControls?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

const A4BillPreview = forwardRef<HTMLDivElement, A4BillPreviewProps>(({
  billData,
  templateComplexity,
  showControls = true,
  onDownload,
  onPrint,
  onShare
}, ref) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${billData.invoiceDetails.invoiceNumber}.pdf`);

      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    if (!previewRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${billData.invoiceDetails.invoiceNumber}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @media print { body { margin: 0; } }
              @page { size: A4; margin: 0.5in; }
            </style>
          </head>
          <body>
            ${previewRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }

    if (onPrint) onPrint();
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getTemplateStyles = () => {
    switch (templateComplexity) {
      case TemplateComplexity.EASY:
        return {
          headerBg: '#f5f5f5',
          accentColor: '#1976d2',
          fontFamily: 'Arial, sans-serif'
        };
      case TemplateComplexity.BETTER:
        return {
          headerBg: '#e3f2fd',
          accentColor: '#1565c0',
          fontFamily: 'Roboto, sans-serif'
        };
      case TemplateComplexity.COMPLEX:
        return {
          headerBg: '#e8f5e8',
          accentColor: '#2e7d32',
          fontFamily: 'Open Sans, sans-serif'
        };
      case TemplateComplexity.DETAILED:
        return {
          headerBg: '#fff3e0',
          accentColor: '#f57c00',
          fontFamily: 'Lato, sans-serif'
        };
      default:
        return {
          headerBg: '#f5f5f5',
          accentColor: '#1976d2',
          fontFamily: 'Arial, sans-serif'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <Box>
      {showControls && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            size="small"
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={onShare}
            size="small"
          >
            Share
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            size="small"
          >
            Download PDF
          </Button>
        </Box>
      )}

      <Paper
        ref={ref || previewRef}
        elevation={3}
        sx={{
          width: '210mm', // A4 width
          minHeight: '297mm', // A4 height
          maxWidth: '100%',
          margin: '0 auto',
          padding: '20mm',
          backgroundColor: 'white',
          fontFamily: styles.fontFamily,
          fontSize: '10pt',
          lineHeight: 1.4,
          boxSizing: 'border-box',
          '@media print': {
            boxShadow: 'none',
            margin: 0,
            width: '210mm',
            height: '297mm'
          }
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            {/* Company Info */}
            <Box sx={{ flex: 1 }}>
              {billData.companyInfo.logo && (
                <Box sx={{
                  mb: 2,
                  maxWidth: '150px',
                  height: '60px',
                  '& img': {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }
                }}>
                  <img
                    src={billData.companyInfo.logo}
                    alt="Company Logo"
                  />
                </Box>
              )}
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: styles.accentColor, mb: 1 }}>
                {billData.companyInfo.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {billData.companyInfo.address}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Phone: {billData.companyInfo.phone} | Email: {billData.companyInfo.email}
              </Typography>
              {billData.companyInfo.website && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Website: {billData.companyInfo.website}
                </Typography>
              )}
              {billData.companyInfo.taxId && (
                <Typography variant="body2">
                  Tax ID: {billData.companyInfo.taxId}
                </Typography>
              )}
            </Box>

            {/* Invoice Title */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  color: styles.accentColor,
                  mb: 1,
                  fontSize: '2.5rem'
                }}
              >
                INVOICE
              </Typography>
              <Box sx={{ bgcolor: styles.headerBg, p: 2, borderRadius: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Invoice #: {billData.invoiceDetails.invoiceNumber}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Date: {new Date(billData.invoiceDetails.invoiceDate).toLocaleDateString()}
                </Typography>
                {billData.invoiceDetails.dueDate && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Due Date: {new Date(billData.invoiceDetails.dueDate).toLocaleDateString()}
                  </Typography>
                )}
                {billData.invoiceDetails.poNumber && (
                  <Typography variant="body2">
                    PO Number: {billData.invoiceDetails.poNumber}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: styles.accentColor, borderWidth: 2 }} />

          {/* Customer Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: styles.accentColor }}>
              Bill To:
            </Typography>
            <Box sx={{ bgcolor: '#fafafa', p: 2, borderRadius: 1, borderLeft: `4px solid ${styles.accentColor}` }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {billData.customerInfo.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {billData.customerInfo.address}
              </Typography>
              {billData.customerInfo.phone && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Phone: {billData.customerInfo.phone}
                </Typography>
              )}
              {billData.customerInfo.email && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Email: {billData.customerInfo.email}
                </Typography>
              )}
              {billData.customerInfo.taxId && (
                <Typography variant="body2">
                  Tax ID: {billData.customerInfo.taxId}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Items Table */}
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: styles.accentColor }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 'none' }}>
                  Description
                </TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', border: 'none' }}>
                  Qty
                </TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', border: 'none' }}>
                  Rate
                </TableCell>
                {templateComplexity !== TemplateComplexity.EASY && (
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', border: 'none' }}>
                    Tax %
                  </TableCell>
                )}
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', border: 'none' }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billData.items.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:nth-of-type(even)': { bgcolor: '#f9f9f9' },
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <TableCell sx={{ border: '1px solid #e0e0e0', py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {item.description}
                    </Typography>
                    {item.category && templateComplexity !== TemplateComplexity.EASY && (
                      <Typography variant="caption" color="text.secondary">
                        Category: {item.category}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #e0e0e0' }}>
                    {item.quantity} {item.unit || ''}
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                    {formatCurrency(item.rate, billData.invoiceDetails.currency)}
                  </TableCell>
                  {templateComplexity !== TemplateComplexity.EASY && (
                    <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                      {item.taxRate ? `${item.taxRate}%` : '0%'}
                    </TableCell>
                  )}
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0', fontWeight: 'medium' }}>
                    {formatCurrency(item.amount, billData.invoiceDetails.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Calculations */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Box sx={{ minWidth: '300px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {formatCurrency(billData.calculations.subtotal, billData.invoiceDetails.currency)}
              </Typography>
            </Box>

            {billData.calculations.discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="body1">Discount:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                  -{formatCurrency(billData.calculations.discountAmount, billData.invoiceDetails.currency)}
                </Typography>
              </Box>
            )}

            {billData.calculations.taxAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="body1">Tax:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formatCurrency(billData.calculations.taxAmount, billData.invoiceDetails.currency)}
                </Typography>
              </Box>
            )}

            {billData.calculations.shippingAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formatCurrency(billData.calculations.shippingAmount, billData.invoiceDetails.currency)}
                </Typography>
              </Box>
            )}

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 2,
              bgcolor: styles.accentColor,
              color: 'white',
              mt: 1,
              px: 2,
              borderRadius: 1
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(billData.calculations.totalAmount, billData.invoiceDetails.currency)}
              </Typography>
            </Box>


          </Box>
        </Box>

        {/* Additional Information */}
        {(billData.additionalInfo.notes || billData.additionalInfo.terms) && (
          <Box sx={{ mb: 3 }}>
            {billData.additionalInfo.notes && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: styles.accentColor }}>
                  Notes:
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                  {billData.additionalInfo.notes}
                </Typography>
              </Box>
            )}

            {billData.additionalInfo.terms && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: styles.accentColor }}>
                  Terms & Conditions:
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                  {billData.additionalInfo.terms}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Payment Information */}
        {(billData.additionalInfo.paymentMethods || billData.additionalInfo.bankDetails) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: styles.accentColor }}>
              Payment Information:
            </Typography>

            {billData.additionalInfo.paymentMethods && billData.additionalInfo.paymentMethods.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Accepted Payment Methods:
                </Typography>
                <Typography variant="body2">
                  {billData.additionalInfo.paymentMethods.join(', ')}
                </Typography>
              </Box>
            )}

            {billData.additionalInfo.bankDetails && (
              <Box sx={{ bgcolor: '#f0f0f0', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Bank Details:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {billData.additionalInfo.bankDetails}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: `2px solid ${styles.accentColor}`, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Thank you for your business!
          </Typography>
          {billData.additionalInfo.signature && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                {billData.additionalInfo.signature}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
});

A4BillPreview.displayName = 'A4BillPreview';

export default A4BillPreview;
