import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import BusinessProfileSettings from '../components/settings/BusinessProfileSettings';
import InvoiceSettings from '../components/settings/InvoiceSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import SecuritySettings from '../components/settings/SecuritySettings';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Settings component serves as a container for different settings sections
 * Follows Single Responsibility Principle by delegating specific settings to focused components
 * Uses composition to combine BusinessProfileSettings, InvoiceSettings, AppearanceSettings, and SecuritySettings
 */
const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Configure your application preferences and business settings
        </Typography>
      </Box>

      {/* Settings Tabs */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<BusinessIcon />} 
            label="Business Profile" 
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          <Tab 
            icon={<ReceiptIcon />} 
            label="Invoice Settings" 
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          <Tab 
            icon={<PaletteIcon />} 
            label="Appearance" 
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Security" 
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
        </Tabs>

        {/* Business Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <BusinessProfileSettings />
        </TabPanel>

        {/* Invoice Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <InvoiceSettings />
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={2}>
          <AppearanceSettings />
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <SecuritySettings />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Settings;
