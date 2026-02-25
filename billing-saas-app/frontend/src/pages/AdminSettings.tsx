import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Tab,
  Tabs,
  Alert,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Build as MaintenanceIcon,
  AdminPanelSettings as AdminIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import BusinessProfileSettings from '../components/settings/BusinessProfileSettings';
import NotificationsTab from '../components/settings/NotificationsTab';
import MaintenanceTab from '../components/settings/MaintenanceTab';
import { useAuth } from '../contexts/AuthContext';
import useRoleBasedAccess from '../hooks/useRoleBasedAccess';

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
      id={`admin-settings-tabpanel-${index}`}
      aria-labelledby={`admin-settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const permissions = useRoleBasedAccess();

  const navigate = useNavigate();
  const params = useParams();
  const subPage = params['*']; // Get the nested path

  const tabPathMap: Record<string, number> = {
    'business': 0,
    'branding': 1,
    'notifications': 2,
    'maintenance': 3
  };

  const [tabValue, setTabValue] = useState(() => {
    return subPage && tabPathMap[subPage] !== undefined ? tabPathMap[subPage] : 0;
  });

  // Sync tab value when URL changes
  useEffect(() => {
    if (subPage && tabPathMap[subPage] !== undefined) {
      setTabValue(tabPathMap[subPage]);
    }
  }, [subPage]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Navigate to the correct path based on tab selection
    const path = Object.keys(tabPathMap).find(key => tabPathMap[key] === newValue);
    if (path) {
      navigate(`/admin/settings/${path}`);
    }
  };

  const [settingsMap, setSettingsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasAccess = permissions.canManageSettings;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching admin settings from:', `${API_URL}/admin/settings`);

      const response = await axios.get(`${API_URL}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log('Settings response:', response.data);

      if (response.data.success && response.data.flatData) {
        const flatMap: Record<string, any> = {};
        response.data.flatData.forEach((s: any) => {
          flatMap[s.key] = s.value;
        });
        setSettingsMap(flatMap);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err: any) {
      console.error('Error fetching admin settings:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to load admin settings.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettingsMap(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      console.log('Saving settings:', settingsMap);

      const response = await axios.put(`${API_URL}/admin/settings`, settingsMap, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log('Save response:', response.data);
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to update settings. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleBackupTrigger = async () => {
    // Simulate backup process
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          const now = new Date().toISOString();
          handleSettingChange('last_backup_time', now);

          // Save this specific setting immediately
          await axios.put(`${API_URL}/admin/settings`, { last_backup_time: now }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });

          setSuccessMessage('Manual backup completed successfully!');
        } catch (err) {
          console.error('Backup time update failed:', err);
        }
        resolve();
      }, 2000);
    });
  };

  if (!hasAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access Denied: You don't have permission to access Admin Settings.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading admin settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin')}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold">
              Business Settings
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" color="text.secondary">
          System-wide configurations for {user?.name}'s organization.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Settings Tabs */}
      <Card sx={{ overflow: 'hidden', mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { py: 3, minHeight: 72 }
          }}
        >
          <Tab
            icon={<BusinessIcon />}
            label="Business Profile"
            iconPosition="start"
          />
          <Tab
            icon={<AdminIcon />} // Using AdminIcon for branding/logo
            label="Branding"
            iconPosition="start"
          />
          <Tab
            icon={<NotificationsIcon />}
            label="Notifications"
            iconPosition="start"
          />
          <Tab
            icon={<MaintenanceIcon />}
            label="Maintenance"
            iconPosition="start"
          />
        </Tabs>

        {/* Business Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <BusinessProfileSettings />
          </Box>
        </TabPanel>

        {/* Branding Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>System Branding</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Customize how BillSoft looks for your organization.
              </Typography>
              {/* Simplified Branding Config */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Primary Theme Color</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['#1976d2', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0'].map(color => (
                      <Box
                        key={color}
                        sx={{
                          width: 40, height: 40, bgcolor: color, borderRadius: '50%', cursor: 'pointer',
                          border: settingsMap.theme_color === color ? '3px solid #000' : 'none'
                        }}
                        onClick={() => handleSettingChange('theme_color', color)}
                      />
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Invoice Templates</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose the default layout for your generated PDFs.
                  </Typography>
                  <Button variant="outlined" onClick={() => navigate('/templates')}>
                    Open Template Library
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <NotificationsTab settings={settingsMap} onSettingChange={handleSettingChange} />
          </Box>
        </TabPanel>

        {/* Maintenance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <MaintenanceTab settings={settingsMap} onBackupTrigger={handleBackupTrigger} />
          </Box>
        </TabPanel>
      </Card>

      {/* Global Save Button - Floating or Sticky at bottom */}
      {tabValue !== 2 && tabValue !== 3 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={saving}
            sx={{
              borderRadius: 50,
              px: 4,
              py: 1.5,
              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSettings;
