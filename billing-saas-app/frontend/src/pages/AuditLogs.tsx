
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    description: string;
    ipAddress: string;
    timestamp: string;
}

const AuditLogs: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`${API_URL}/admin/audit-logs?t=${Date.now()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Audit Logs Data:', data);
                    setLogs(data.logs);
                } else {
                    console.error('Failed to fetch logs:', res.status, res.statusText);
                    // Add handling for 401/403 to redirect or show error
                }
            } catch (error) {
                console.error(error);
                setLogs([]);
            } finally {
                setLoading(false);
            }
        }
        if (user) fetchLogs();
    }, [user]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'DELETE': return 'error';
            default: return 'default';
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Audit Trail</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Security and activity logs for compliance
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Entity</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>IP Address</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center"><CircularProgress /></TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No logs found.</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip label={log.action} color={getActionColor(log.action) as any} size="small" />
                                        </TableCell>
                                        <TableCell>{log.entity}</TableCell>
                                        <TableCell>{log.description}</TableCell>
                                        <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AuditLogs;
