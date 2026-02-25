
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Box,
    CircularProgress,
    Badge
} from '@mui/material';
import { Warning as WarningIcon, Event as EventIcon } from '@mui/icons-material';
import { API_URL } from '../../config/api';

const InventoryAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<any>({ lowStock: [], expiringSoon: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const token = localStorage.getItem('authToken');
                // Cache buster for real-time accuracy
                const res = await fetch(`${API_URL}/inventory/alerts?t=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAlerts(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();

        const handleUpdate = () => {
            // Tiny delay to ensure SQLite write is readable
            setTimeout(fetchAlerts, 300);
        };

        window.addEventListener('inventory-updated', handleUpdate);
        window.addEventListener('bill-created', handleUpdate);
        window.addEventListener('refresh-notifications', handleUpdate);

        const interval = setInterval(fetchAlerts, 45000);

        return () => {
            window.removeEventListener('inventory-updated', handleUpdate);
            window.removeEventListener('bill-created', handleUpdate);
            window.removeEventListener('refresh-notifications', handleUpdate);
            clearInterval(interval);
        };
    }, []);

    if (loading) return <CircularProgress size={20} />;

    if (alerts.lowStock.length === 0 && alerts.expiringSoon.length === 0) return null;

    const totalAlerts = alerts.lowStock.length + alerts.expiringSoon.length;

    return (
        <Card sx={{
            mb: 3,
            border: '2px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                bgcolor: 'error.main',
                animation: 'pulse 2s ease-in-out infinite',
            },
            '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
            }
        }}>
            <CardContent>
                <Box sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    mb: 2
                }}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
                        <WarningIcon color="error" sx={{ mr: 1 }} /> Inventory Alerts
                    </Typography>
                    <Chip
                        label={`${totalAlerts} Items Need Attention`}
                        color="error"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <Box display="flex" flexWrap="wrap" gap={2}>
                    {alerts.lowStock.length > 0 && (
                        <Box flex={1} minWidth={{ xs: '100%', sm: 300 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                                    Low Stock Items
                                </Typography>
                                <Badge
                                    badgeContent={alerts.lowStock.length}
                                    color="error"
                                    sx={{ ml: 2 }}
                                />
                            </Box>
                            <List dense sx={{ px: 0 }}>
                                {alerts.lowStock.map((item: any) => (
                                    <ListItem
                                        key={item.id}
                                        sx={{
                                            bgcolor: 'white',
                                            borderRadius: 2,
                                            mb: 1,
                                            border: '1px solid',
                                            borderColor: 'error.light',
                                            px: { xs: 1, sm: 2 },
                                            flexDirection: { xs: 'row', sm: 'row' },
                                            alignItems: 'center'
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: { xs: 24, sm: 30 } }}>
                                            <WarningIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight="bold" noWrap>{item.name}</Typography>}
                                            secondary={<Typography variant="caption" color="text.secondary">{`Stock: ${item.stock} (Min: ${item.minStockLevel || 10})`}</Typography>}
                                            sx={{ mr: 1 }}
                                        />
                                        <Chip
                                            label="Restock"
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            sx={{
                                                height: 24,
                                                fontSize: '0.65rem',
                                                display: { xs: 'none', sm: 'flex' }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {alerts.expiringSoon.length > 0 && (
                        <Box flex={1} minWidth={{ xs: '100%', sm: 300 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="warning.dark" fontWeight="bold">
                                    Expiring Soon
                                </Typography>
                                <Badge
                                    badgeContent={alerts.expiringSoon.length}
                                    color="warning"
                                    sx={{ ml: 2 }}
                                />
                            </Box>
                            <List dense sx={{ px: 0 }}>
                                {alerts.expiringSoon.slice(0, 5).map((item: any) => (
                                    <ListItem
                                        key={item.id}
                                        sx={{
                                            bgcolor: 'white',
                                            borderRadius: 2,
                                            mb: 1,
                                            border: '1px solid',
                                            borderColor: 'warning.light',
                                            px: { xs: 1, sm: 2 },
                                            alignItems: 'center'
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: { xs: 24, sm: 30 } }}>
                                            <EventIcon fontSize="small" color="warning" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight="bold" noWrap>{item.name}</Typography>}
                                            secondary={<Typography variant="caption" color="text.secondary">{`Exp: ${new Date(item.expiryDate).toLocaleDateString()}`}</Typography>}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default InventoryAlerts;
