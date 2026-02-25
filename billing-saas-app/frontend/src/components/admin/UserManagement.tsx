import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'accountant' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      phone: '+91 98765 43210',
      role: 'admin',
      status: 'active',
      createdAt: '2026-01-01',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'viewer' as 'admin' | 'manager' | 'accountant' | 'viewer',
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'viewer',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'viewer',
    });
  };

  const handleSubmit = () => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
    } else {
      // Create new user
      const newUser: User = {
        id: String(users.length + 1),
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    handleCloseDialog();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'primary';
      case 'accountant':
        return 'secondary';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to all features and settings';
      case 'manager':
        return 'Can manage customers, products, and bills';
      case 'accountant':
        return 'Can view and create bills, limited editing';
      case 'viewer':
        return 'Read-only access to dashboard and reports';
      default:
        return '';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage team access and permissions for your organization
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Add User
        </Button>
      </Box>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          User {editingUser ? 'updated' : 'created'} successfully! Access credentials have been sent to their email.
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight={600} color="primary">
              {users.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight={600} color="error.main">
              {users.filter(u => u.role === 'admin').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admins
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight={600} color="primary">
              {users.filter(u => u.role === 'manager').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Managers
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight={600} color="success.main">
              {users.filter(u => u.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            Team Members
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F3F6FB' }}>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.875rem' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.875rem' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow 
                    key={user.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFC',
                      height: '48px',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.phone || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.toUpperCase()} 
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status.toUpperCase()} 
                        color={user.status === 'active' ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(user)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {user.role !== 'admin' && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingUser 
              ? 'Update user information and role' 
              : 'Provide user details to grant access'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <MenuItem value="admin">
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Admin</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full access to all features
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="manager">
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Manager</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Manage customers, products, and bills
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="accountant">
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Accountant</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create and view bills
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="viewer">
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Viewer</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Read-only access
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ p: 2, bgcolor: '#F9FAFC', borderRadius: '8px', border: '1px solid #E6E9F0' }}>
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                Selected Role Permissions:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getRoleDescription(formData.role)}
              </Typography>
            </Box>

            {!editingUser && (
              <Alert severity="info">
                An automated email with login credentials will be sent to the user's email address.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.email}
          >
            {editingUser ? 'Update User' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
