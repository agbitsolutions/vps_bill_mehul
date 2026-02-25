import React from 'react';
import { Box } from '@mui/material';
import InvoiceTemplateLibrary from '../components/templates/InvoiceTemplateLibrary';

/**
 * Invoice Template Library Page
 * Standalone page for managing invoice templates
 */
const InvoiceTemplateLibraryPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <InvoiceTemplateLibrary />
    </Box>
  );
};

export default InvoiceTemplateLibraryPage;
