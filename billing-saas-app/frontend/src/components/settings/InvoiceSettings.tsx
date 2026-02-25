import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import TaxSettings from './TaxSettings';
import ColumnSettings from './ColumnSettings';

/**
 * InvoiceSettings component handles invoice-related configuration
 * Follows Single Responsibility Principle by focusing only on invoice settings
 * Template management has been moved to Admin Settings for better organization
 */
const InvoiceSettings: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Note:</strong> Invoice template management has been moved to Admin Settings 
          for better organization and security. Only administrators can modify default templates.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Tax Configuration
          </Typography>
          <TaxSettings />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Invoice Columns
          </Typography>
          <ColumnSettings />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Invoice Preferences
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-generate invoice numbers"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include company logo on invoices"
            />
            <FormControlLabel
              control={<Switch />}
              label="Send email notifications for new invoices"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Show payment terms on invoices"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include tax breakdown in invoice summary"
            />
            <FormControlLabel
              control={<Switch />}
              label="Require approval for invoices over threshold"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceSettings;
