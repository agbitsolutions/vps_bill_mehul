import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  CreditCard as BillingIcon,
  Business as BusinessIcon,
  ManageAccounts as ManageAccountsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useRoleBasedAccess from '../hooks/useRoleBasedAccess';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = useRoleBasedAccess();

  if (!permissions.canViewAdminPanel) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access Denied: You don't have permission to access the Admin Panel.
        </Alert>
      </Box>
    );
  }

  const adminTools = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: <UsersIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      path: '/admin/users',
      enabled: permissions.canManageUsers
    },
    {
      title: 'Business Settings',
      description: 'Configure company profile, branding, and invoice templates',
      icon: <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      path: '/admin/settings',
      enabled: permissions.canManageSettings
    },
    {
      title: 'Security Settings',
      description: 'Manage RBAC, API keys, and security activity logs',
      icon: <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      path: '/admin/security',
      enabled: permissions.canManageSettings
    },
    {
      title: 'Subscription & Plans',
      description: 'Manage pricing tiers, billing cycle, and feature toggles',
      icon: <BillingIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      path: '/admin/subscription',
      enabled: true // accessible for viewing for now
    },
    {
      title: 'Admin Settings',
      description: 'Control application-wide settings, user permissions, and data visibility',
      icon: <ManageAccountsIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      path: '/admin/app-settings',
      enabled: permissions.canManageSettings
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and user actions history',
      icon: <HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      path: '/admin/audit-logs',
      enabled: permissions.canManageSettings
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.name}! You have administrator access to manage the system.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Administrator Mode:</strong> You have full system access. Be careful when making changes.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {adminTools.map((tool, index) => (
          <Card
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              cursor: tool.enabled ? 'pointer' : 'default',
              opacity: tool.enabled ? 1 : 0.6,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s ease',
              '&:hover': tool.enabled ? {
                boxShadow: 4,
                transform: 'translateY(-2px)',
                borderColor: 'primary.main'
              } : {}
            }}
            onClick={tool.enabled ? () => navigate(tool.path) : undefined}
          >
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {tool.icon}
                <Typography variant="h6" fontWeight="bold">
                  {tool.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {tool.description}
              </Typography>
              {tool.enabled && (
                <Box sx={{ mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(tool.path);
                    }}
                  >
                    Access
                  </Button>
                </Box>
              )}
              {!tool.enabled && (
                <Typography variant="caption" color="error" sx={{ mt: 'auto', pt: 1, display: 'block' }}>
                  Insufficient permissions
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AdminPanel;
