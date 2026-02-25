
import React, { useState } from 'react';
import {
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Typography,
    IconButton,
    InputAdornment,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fab,
    useTheme,
    useMediaQuery,
    Avatar,
    Divider,
    Stack,
    Tooltip,
    Alert,
    CircularProgress,
    Paper,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Phone,
    Email,
    Business,
    Person,
    FilterList as FilterListIcon,
    GetApp as ExportIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import { useSuppliers, Supplier } from '../hooks/useSuppliers';
import { formatCurrency } from '../utils/currency';

const Suppliers: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [balanceFilter, setBalanceFilter] = useState('All');
    const [dateRange, setDateRange] = useState('All Time');

    const { suppliers, addSupplier, updateSupplier, deleteSupplier, loading, error } = useSuppliers();

    const [formData, setFormData] = useState<Partial<Supplier>>({
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
        balance: 0
    });

    const handleOpenAdd = () => {
        setEditMode(false);
        setCurrentSupplierId(null);
        setFormData({ name: '', contact: '', phone: '', email: '', address: '', balance: 0 });
        setOpen(true);
    };

    const handleOpenEdit = (supplier: Supplier) => {
        setEditMode(true);
        setCurrentSupplierId(supplier.id);
        setFormData({
            name: supplier.name,
            contact: supplier.contact,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            balance: supplier.balance
        });
        setOpen(true);
    };

    const handleSave = async () => {
        if (editMode && currentSupplierId) {
            const res = await updateSupplier(currentSupplierId, formData);
            if (res.success) setOpen(false);
        } else {
            const res = await addSupplier(formData);
            if (res.success) setOpen(false);
        }
    };

    const handleDeleteRequested = (supplier: Supplier) => {
        setSupplierToDelete(supplier);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (supplierToDelete) {
            await deleteSupplier(supplierToDelete.id);
            setDeleteConfirmOpen(false);
            setSupplierToDelete(null);
        }
    };

    const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'list' | 'grid') => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contact && s.contact.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const renderSupplierCard = (supplier: Supplier) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={supplier.id}>
            <Card sx={{
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    borderColor: 'primary.light'
                }
            }}>
                <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(supplier)}
                        sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}>
                        <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteRequested(supplier)}
                        sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{
                            bgcolor: theme.palette.info.main,
                            width: 50,
                            height: 50,
                            fontWeight: 'bold',
                            fontSize: '1.25rem'
                        }}>
                            {supplier.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ pr: 6 }}>
                            <Typography variant="subtitle1" fontWeight="700" noWrap sx={{ maxWidth: 140 }}>
                                {supplier.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <Person sx={{ fontSize: 14 }} />
                                <Typography variant="caption" noWrap>
                                    {supplier.contact || 'No Contact'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{supplier.phone || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {supplier.email || 'N/A'}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Balance
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="800" color={supplier.balance > 0 ? 'error.main' : 'success.main'}>
                            {formatCurrency(supplier.balance)}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );

    return (
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Suppliers
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Manage your vendor profiles and outstanding balances
                </Typography>
            </Box>

            {/* Controls Bar */}
            <Paper sx={{ p: 2, mb: 4 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    flexWrap: 'wrap'
                }}>
                    {/* Left Side: Search & Filters */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
                        <TextField
                            placeholder="Search suppliers..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 } }}
                        />

                        <TextField
                            select
                            size="small"
                            value={balanceFilter}
                            onChange={(e) => setBalanceFilter(e.target.value)}
                            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 150 } }}
                            label="Balance"
                        >
                            <MenuItem value="all">All Suppliers</MenuItem>
                            <MenuItem value="outstanding">Outstanding Balance</MenuItem>
                            <MenuItem value="zero">Zero Balance</MenuItem>
                        </TextField>

                        <TextField
                            select
                            size="small"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 150 } }}
                            label="Date Added"
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                            <MenuItem value="quarter">This Quarter</MenuItem>
                        </TextField>
                    </Box>

                    {/* Right Side: Actions */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        width: { xs: '100%', md: 'auto' },
                        justifyContent: { xs: 'space-between', md: 'flex-end' },
                        flexWrap: 'wrap'
                    }}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewChange}
                            size="small"
                            aria-label="view mode"
                            sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                            <ToggleButton value="list" aria-label="list view">
                                <ViewListIcon />
                            </ToggleButton>
                            <ToggleButton value="grid" aria-label="grid view">
                                <ViewModuleIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            sx={{ flexGrow: { xs: 1, sm: 0 } }}
                        >
                            Filters
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ExportIcon />}
                            sx={{ flexGrow: { xs: 1, sm: 0 } }}
                        >
                            Export
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenAdd}
                            sx={{ flexGrow: { xs: 1, sm: 0 } }}
                        >
                            Add Supplier
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Content Area */}
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={32} /></Box>
            ) : (
                <>
                    {filteredSuppliers.length > 0 ? (
                        <>
                            {viewMode === 'list' ? (
                                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                                    <Table sx={{ minWidth: 800 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Supplier Name</TableCell>
                                                <TableCell>Contact Person</TableCell>
                                                <TableCell>Contact Info</TableCell>
                                                <TableCell align="right">Balance</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredSuppliers.map((supplier) => (
                                                <TableRow key={supplier.id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                                                                {supplier.name.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography fontWeight="medium">{supplier.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="body2">{supplier.contact || 'N/A'}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" flexDirection="column">
                                                            {supplier.email && (
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                    <Typography variant="body2">{supplier.email}</Typography>
                                                                </Box>
                                                            )}
                                                            {supplier.phone && (
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                    <Typography variant="body2">{supplier.phone}</Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={formatCurrency(supplier.balance)}
                                                            color={supplier.balance > 0 ? 'error' : 'success'}
                                                            variant="outlined"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" onClick={() => handleOpenEdit(supplier)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteRequested(supplier)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Grid container spacing={2}>
                                    {filteredSuppliers.map(renderSupplierCard)}
                                </Grid>
                            )}
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed divider' }}>
                            <Business sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="subtitle1" color="text.secondary">No suppliers found</Typography>
                        </Box>
                    )}
                </>
            )}

            {/* Mobile View FAB */}
            {isMobile && (
                <Fab color="primary" sx={{ position: 'fixed', bottom: 85, right: 16, zIndex: 1000 }} onClick={handleOpenAdd}>
                    <AddIcon />
                </Fab>
            )}

            {/* Dialogs */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{editMode ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Company Name" fullWidth required value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Contact Person" fullWidth value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Phone Number" fullWidth value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </Grid>
                        </Grid>
                        <TextField label="Email Address" fullWidth type="email" value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <TextField label="Address" fullWidth multiline rows={2} value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        <TextField label="Opening Balance" fullWidth type="number" value={formData.balance}
                            disabled={editMode} onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, px: 3 }}>
                        {editMode ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Supplier?</DialogTitle>
                <DialogContent>
                    <Typography>Confirm deletion of <strong>{supplierToDelete?.name}</strong>.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Suppliers;
