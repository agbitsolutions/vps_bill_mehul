import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AdminPanelSettings as AdminIcon,
  LibraryBooks as TemplateIcon,
  GroupWork as GroupWorkIcon,
  CurrencyRupee as MoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const drawerWidth = 280;
const collapsedWidth = 70;

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileToggle
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { canAccessNavigation } = useAuth();

  const allMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      show: canAccessNavigation('dashboard')
    },
    {
      text: 'Bills',
      icon: <ReceiptIcon />,
      path: '/bills',
      show: canAccessNavigation('bills')
    },
    {
      text: 'Customers',
      icon: <PeopleIcon />,
      path: '/customers',
      show: canAccessNavigation('customers')
    },
    {
      text: 'Products',
      icon: <InventoryIcon />,
      path: '/products',
      show: canAccessNavigation('products')
    },
    {
      text: 'Suppliers',
      icon: <GroupWorkIcon />,
      path: '/suppliers',
      show: canAccessNavigation('products')
    },
    {
      text: 'Expenses',
      icon: <MoneyIcon />,
      path: '/expenses',
      show: canAccessNavigation('dashboard')
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/reports',
      show: canAccessNavigation('dashboard') // Reports under dashboard navigation
    },
    {
      text: 'Template Library',
      icon: <TemplateIcon />,
      path: '/templates',
      show: canAccessNavigation('settings') // Template Library accessible to users with settings access
    },
    {
      text: 'Admin Panel',
      icon: <AdminIcon />,
      path: '/admin',
      show: canAccessNavigation('adminPanel')
    },

    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      show: canAccessNavigation('settings')
    },
  ];

  const menuItems = allMenuItems.filter(item => item.show);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {(!collapsed || isMobile) && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              whiteSpace: 'nowrap', // Isse text dabba nahi banega
              overflow: 'visible'   // Text full dikhega
            }}
          >
            BillSoft
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                  px: 2.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.contrastText,
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                onClick={isMobile ? onMobileToggle : undefined}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed && !isMobile ? 0 : 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: collapsed && !isMobile ? 0 : 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        {(!collapsed || isMobile) && (
          <Typography variant="caption" color="text.secondary">
            © 2025 BillSoft
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '@media print': {
              display: 'none !important'
            },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? collapsedWidth : drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              '@media print': {
                display: 'none !important'
              }
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: collapsed ? collapsedWidth : drawerWidth,
            flexShrink: 0,
            '@media print': {
              display: 'none !important'
            },
            '& .MuiDrawer-paper': {
              width: collapsed ? collapsedWidth : drawerWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              overflowX: 'hidden',
              '@media print': {
                display: 'none !important'
              }
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
