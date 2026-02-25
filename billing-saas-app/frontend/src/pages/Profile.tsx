import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  AccountTree as RoleIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface OrganizationData {
  companyName: string;
  organizationSize: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile, switchRole, availableRoles } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orgData, setOrgData] = useState<OrganizationData | null>(null);
  
  // Load organization data from signup
  useEffect(() => {
    const storedData = localStorage.getItem('organizationData');
    if (storedData) {
      setOrgData(JSON.parse(storedData));
    }
  }, []);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    role: user?.role || 'admin',
  });

  // Update formData when orgData is loaded
  useEffect(() => {
    if (orgData) {
      setFormData(prev => ({
        ...prev,
        name: orgData.adminName || prev.name,
        email: orgData.adminEmail || prev.email,
        phone: orgData.adminPhone || prev.phone,
        company: orgData.companyName || prev.company,
      }));
    }
  }, [orgData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    
    // Update organization data in localStorage
    if (orgData) {
      const updatedOrgData = {
        ...orgData,
        adminName: formData.name,
        adminEmail: formData.email,
        adminPhone: formData.phone,
        companyName: formData.company,
      };
      localStorage.setItem('organizationData', JSON.stringify(updatedOrgData));
      setOrgData(updatedOrgData);
    }
    
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    if (orgData) {
      setFormData({
        name: orgData.adminName || user?.name || '',
        email: orgData.adminEmail || user?.email || '',
        phone: orgData.adminPhone || '',
        company: orgData.companyName || '',
        role: user?.role || 'admin',
      });
    }
    setIsEditing(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Profile Information */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Profile Information
                  </Typography>
                </Box>
                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    variant="outlined"
                    size="small"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      variant="contained"
                      size="small"
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      variant="outlined"
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Organization Info */}
              {orgData && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#F9FAFC', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" color="primary" />
                    Organization Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Company:</strong> {orgData.companyName}
                  </Typography>
                  {orgData.organizationSize && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Size:</strong> {orgData.organizationSize} employees
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant="outlined"
                    type="email"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant="outlined"
                    placeholder="+91 9876543210"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Role"
                    value={formData.role}
                    disabled
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Profile Picture & Account Info */}
        <Box>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    color="primary"
                    component="label"
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      border: 2,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input type="file" hidden accept="image/*" />
                  </IconButton>
                }
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {user?.name || 'Admin User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email || 'admin@admin.com'}
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="medium">
                {user?.plan || 'Enterprise Plan'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Status
                </Typography>
                <Typography variant="body2" color="success.main" fontWeight="medium" gutterBottom>
                  ✓ Active
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Member Since
                </Typography>
                <Typography variant="body2" gutterBottom>
                  October 2025
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Last Login
                </Typography>
                <Typography variant="body2">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  startIcon={<SecurityIcon />}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Change Password
                </Button>
                <Button
                  startIcon={<PersonIcon />}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Privacy Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Role Testing & Application Views */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Application Views & Role Testing
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          As an administrator, you can switch between different roles to test how the application appears for different types of users.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Role Switching */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Switch User Role
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Experience the application from different user perspectives. Your current role affects which features and data you can access.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Role: <Chip label={user?.role?.toUpperCase()} color="primary" size="small" />
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {availableRoles.map((roleOption) => (
                  <Card 
                    key={roleOption.name}
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: user?.role === roleOption.name ? '2px solid' : '1px solid',
                      borderColor: user?.role === roleOption.name ? 'primary.main' : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 1
                      }
                    }}
                    onClick={() => switchRole(roleOption.name as any)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {roleOption.name === 'admin' && <AdminIcon color="primary" />}
                        {roleOption.name === 'manager' && <RoleIcon color="primary" />}
                        {roleOption.name === 'staff' && <PersonIcon color="primary" />}
                        {roleOption.name === 'viewer' && <ViewIcon color="primary" />}
                        <Typography variant="subtitle2" fontWeight="bold">
                          {roleOption.displayName}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {roleOption.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Current Permissions */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Current Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your current role grants you the following permissions:
              </Typography>

              <List dense>
                {user?.permissions.map((permission, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={permission.replace(':', ': ').replace('_', ' ')}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Role Description
              </Typography>
              <Typography variant="body2">
                {availableRoles.find(r => r.name === user?.role)?.description}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
