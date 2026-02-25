import React, { useState, useEffect, useRef } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    ListItemText,
    ListItemIcon,
    Divider,
    Snackbar,
    Alert as MuiAlert,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Warning as WarningIcon,
    EventBusy as ExpiryIcon,
    CheckCircle as CheckCircleIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

interface Alert {
    id: string;
    name: string;
    stock?: number;
    expiryDate?: string;
    amount?: number;
    date?: string;
    type: 'stock' | 'expiry' | 'bill';
}

const NotificationCenter: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const lastAlertCount = useRef(0);
    const navigate = useNavigate();

    const fetchAlerts = async (forceRefresh = false) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // Use a timestamp and random string to force bypass any networking cache
            const cacheBuster = `t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`;
            const res = await fetch(`${API_URL}/inventory/alerts?${cacheBuster}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (res.ok) {
                const data = await res.json();
                const newAlerts: Alert[] = [];

                if (Array.isArray(data.lowStock)) {
                    data.lowStock.forEach((p: any) => newAlerts.push({ ...p, type: 'stock' }));
                }
                if (Array.isArray(data.recentBills)) {
                    data.recentBills.forEach((b: any) => {
                        newAlerts.push({ ...b, type: 'bill' });
                    });
                }
                if (Array.isArray(data.notifications)) {
                    data.notifications.forEach((n: any) => {
                        // Avoid duplicates if both are present
                        if (!newAlerts.find(a => a.id === n.id)) {
                            newAlerts.push({ ...n });
                        }
                    });
                }
                if (Array.isArray(data.expiringSoon)) {
                    data.expiringSoon.forEach((p: any) => newAlerts.push({ ...p, type: 'expiry' }));
                }

                // Sorting: Bills first, then Stock
                newAlerts.sort((a, b) => {
                    if (a.type === 'bill' && b.type !== 'bill') return -1;
                    if (a.type !== 'bill' && b.type === 'bill') return 1;
                    return 0;
                });

                // Robust Toast Logic: Show if we have more alerts than before OR if explicitly forced (like after save)
                if (newAlerts.length > lastAlertCount.current || forceRefresh) {
                    const latest = newAlerts[0];
                    if (latest && (newAlerts.length > lastAlertCount.current || forceRefresh)) {
                        setToastMessage(latest.name);
                        setToastOpen(true);
                    }
                }

                lastAlertCount.current = newAlerts.length;
                setAlerts([...newAlerts]); // Create new array reference to ensure re-render
                console.log('Notifications updated:', newAlerts.length);
            }
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        }
    };

    // Effect for initial fetch, event listeners, and interval
    useEffect(() => {
        fetchAlerts(); // Initial fetch

        const handleUpdate = () => {
            console.log('Notification update triggered by event');
            // Give the backend 300ms to ensure SQLite transaction is fully settled on disk
            setTimeout(() => {
                fetchAlerts(true);
            }, 300);
        };

        window.addEventListener('inventory-updated', handleUpdate);
        window.addEventListener('bill-created', handleUpdate);
        window.addEventListener('refresh-notifications', handleUpdate);

        const interval = setInterval(() => fetchAlerts(), 30000); // More frequent polling

        return () => {
            window.removeEventListener('inventory-updated', handleUpdate);
            window.removeEventListener('bill-created', handleUpdate);
            window.removeEventListener('refresh-notifications', handleUpdate);
            clearInterval(interval);
        };
    }, []); // Empty dependency array means this runs once on mount

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToastClose = () => {
        setToastOpen(false);
    };

    const handleItemClick = async (alert: Alert) => {
        handleClose();
        if (alert.type === 'bill') {
            // Mark bill as read/dismissed via API (Permanent)
            try {
                const token = localStorage.getItem('authToken');
                await fetch(`${API_URL}/inventory/notifications/${alert.id}/read`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Optimistic update: Remove from UI immediately
                setAlerts(prev => prev.filter(a => a.id !== alert.id));
                lastAlertCount.current = Math.max(0, lastAlertCount.current - 1);

                navigate(`/bills/view/${alert.id}`);
            } catch (err) {
                console.error("Failed to mark notification as read", err);
            }
        } else {
            navigate('/products');
        }
    };

    // Calculate unread count
    // Since fetchAlerts now filters out read bills, unreadCount is simply the length of the alerts array.
    const unreadCount = alerts.length;

    const hasAlerts = alerts.length > 0;

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 360, maxHeight: 500 }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                </Box>

                {alerts.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                        <CheckCircleIcon sx={{ fontSize: 40, mb: 1, color: 'success.light' }} />
                        <Typography variant="body2">All caught up! No alerts.</Typography>
                    </Box>
                ) : (
                    alerts.map((alert) => (
                        <MenuItem key={`${alert.type}-${alert.id}`} onClick={() => handleItemClick(alert)}>
                            <ListItemIcon>
                                {alert.type === 'stock' && <WarningIcon color="warning" />}
                                {alert.type === 'expiry' && <ExpiryIcon color="error" />}
                                {alert.type === 'bill' && <ReceiptIcon color="primary" />}
                            </ListItemIcon>
                            <ListItemText
                                primary={alert.name}
                                secondary={
                                    alert.type === 'stock' ? `Low Stock: ${alert.stock} remaining` :
                                        alert.type === 'bill' ? `Amount: ₹${alert.amount} • ${new Date(alert.date!).toLocaleTimeString()}` :
                                            `Expires: ${new Date(alert.expiryDate!).toLocaleDateString()}`
                                }
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </MenuItem>
                    ))
                )}

                {hasAlerts && (
                    <>
                        <Divider />
                        <MenuItem onClick={() => { navigate('/products'); handleClose(); }} sx={{ justifyContent: 'center', color: 'primary.main' }}>
                            <Typography variant="button" fontSize="small">View All Activity</Typography>
                        </MenuItem>
                    </>
                )}
            </Menu>

            {/* Popup Toast Notification */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={4000}
                onClose={handleToastClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 7 }}
            >
                <MuiAlert
                    onClose={handleToastClose}
                    severity="info"
                    variant="filled"
                    icon={<NotificationsIcon fontSize="inherit" />}
                    sx={{ width: '100%', boxShadow: 3 }}
                >
                    {toastMessage}
                </MuiAlert>
            </Snackbar>
        </>
    );
};

export default NotificationCenter;
