import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  Logout,
  Person,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import RoleIndicator from './RoleIndicator';
// import BranchSwitcher from './BranchSwitcher';
import NotificationCenter from './NotificationCenter';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '../../contexts/AuthContext';
import useRoleBasedAccess from '../../hooks/useRoleBasedAccess';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';

// Preloads customers & products into shared context as soon as user is logged in
const DataPreloader: React.FC = () => {
  const { refetch: refetchCustomers, customers } = useCustomers();
  const { refetch: refetchProducts, products } = useProducts();
  React.useEffect(() => {
    // Only fetch if not already loaded
    if (customers.length === 0) refetchCustomers();
    if (products.length === 0) refetchProducts();
  }, []);
  return null;
};


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const permissions = useRoleBasedAccess();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signup');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || (!user)) {
    return null;
  }


  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleNavigateToUserSettings = () => {
    navigate('/user-settings');
    handleProfileMenuClose();
  };

  const drawerWidth = 280;
  const collapsedWidth = 70;

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      '@media print': {
        display: 'none !important'
      }
    }}>
      {/* Preload customers & products once when user logs in */}
      <DataPreloader />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        mobileOpen={mobileDrawerOpen}
        onMobileToggle={handleMobileDrawerToggle}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: 100, minHeight: '100vh' }}>
        <AppBar
          position="sticky"
          sx={{
            zIndex: theme.zIndex.drawer - 1,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={isMobile ? handleMobileDrawerToggle : handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            {/* ✅ ONLY CHANGE IS HERE: removed noWrap */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: isMobile ? 0 : 1,
                mr: 2,
                fontWeight: 'bold',
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' } // Hide text on mobile, keep logo/title on tablet+
              }}
            >
              {isMobile ? '' : 'BillSoft'}
            </Typography>

            {isMobile && (
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
                BillSoft
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
              {/* <BranchSwitcher /> */}
              <NotificationCenter />

              <RoleIndicator size="small" />

              <Chip
                label={isMobile ? (user?.plan?.split(' ')[0] || "Basic") : (user?.plan || "Basic Plan")}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  fontWeight: 600,
                  maxWidth: { xs: 70, sm: 'none' },
                  '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } }
                }}
              />

              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 0.2 }}>
                <Avatar sx={{
                  width: { xs: 30, sm: 35 },
                  height: { xs: 30, sm: 35 },
                  bgcolor: theme.palette.primary.main,
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              mt: 1.5,
              minWidth: 200,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.name || 'Admin User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'admin@admin.com'}
            </Typography>
          </Box>

          <MenuItem onClick={handleNavigateToProfile}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleNavigateToUserSettings}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            <ListItemText>User Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        <Box component="main" sx={{ flexGrow: 1, backgroundColor: theme.palette.background.default, overflow: 'auto', pb: isMobile ? 7 : 0 }}>
          <Box sx={{ p: 1, width: '100%', pb: isMobile ? 8 : 1 }}>{children}</Box>
        </Box>
        {isMobile && <MobileBottomNav />}
      </Box>
    </Box>
  );
};

export default Layout;
