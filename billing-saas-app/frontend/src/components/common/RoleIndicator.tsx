import React from 'react';
import { Box, Chip, Typography, Tooltip, useTheme } from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  AccountTree as ManagerIcon,
  Person as StaffIcon,
  Visibility as ViewerIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface RoleIndicatorProps {
  showDescription?: boolean;
  size?: 'small' | 'medium';
}

const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  showDescription = false,
  size = 'small'
}) => {
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) return null;

  const roleConfig = {
    admin: {
      icon: <AdminIcon fontSize="small" />,
      color: 'error' as const,
      label: 'Admin',
      description: 'Full system access'
    },
    manager: {
      icon: <ManagerIcon fontSize="small" />,
      color: 'warning' as const,
      label: 'Manager',
      description: 'Business operations access'
    },
    staff: {
      icon: <StaffIcon fontSize="small" />,
      color: 'info' as const,
      label: 'Staff',
      description: 'Day-to-day operations'
    },
    viewer: {
      icon: <ViewerIcon fontSize="small" />,
      color: 'default' as const,
      label: 'Viewer',
      description: 'Read-only access'
    }
  };

  const currentRole = roleConfig[user.role];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={currentRole.description}>
        <Chip
          icon={currentRole.icon}
          label={currentRole.label}
          color={currentRole.color}
          size={size}
          variant="outlined"
          sx={{
            height: 24,
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            fontWeight: 600,
            '& .MuiChip-label': {
              px: { xs: 0.8, sm: 1 },
              display: 'block'
            },
            '& .MuiChip-icon': {
              fontSize: { xs: '0.85rem', sm: '1rem' },
              mr: { xs: -0.5, sm: 0.5 },
              ml: { xs: 0.5, sm: 0.5 }
            },
            borderColor: currentRole.color === 'default' ? 'divider' : `${currentRole.color}.main`,
            bgcolor: currentRole.color === 'default'
              ? 'action.hover'
              : `rgba(${theme.palette[currentRole.color as 'primary' | 'secondary' | 'error' | 'warning' | 'info'].main}, 0.08)`,
            maxWidth: { xs: 80, sm: 'none' }
          }}
        />
      </Tooltip>
      {showDescription && (
        <Typography variant="caption" color="text.secondary">
          {currentRole.description}
        </Typography>
      )}
    </Box>
  );
};

export default RoleIndicator;
