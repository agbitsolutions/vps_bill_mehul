import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
    Box,
    Paper,
    Typography,
    Button,
    Divider,
    Grid,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Stack,
    IconButton,
    Chip,
    Card,
    Dialog,
    DialogTitle,
    DialogContent,
    CardActionArea,
    CardContent,
    CardMedia,
} from '@mui/material';
import { ArrowBack, Download, Share, Delete, Print, Email, Phone, LocationOn, Settings as SettingsIcon, WhatsApp } from '@mui/icons-material';
import { useBills } from '../hooks/useBills';
import { formatCurrency } from '../utils/currency';
import { Bill } from '../types/bill';
import { MOCK_TEMPLATES, InvoiceTemplate } from '../constants/templates';
import BillTemplateRenderer from '../components/templates/BillTemplateRenderer';
import { API_URL } from '../config/api';

const ViewBill: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { bills, deleteBill, refetch } = useBills();
    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(MOCK_TEMPLATES[0]);
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: bill ? `Invoice-${bill.billNumber || bill.id}` : 'Invoice',
        onAfterPrint: () => console.log('Print finished'),
    });

    useEffect(() => {
        const fetchBill = async () => {
            if (!id) return;

            // 1. Check if we already have it in the bills list
            const foundBill = bills.find(b => b.id === id || b.billNumber === id);

            // 2. If found and has items, use it
            if (foundBill && (foundBill as any).items) {
                setBill(foundBill);
                setLoading(false);
                return;
            }

            // 3. Otherwise fetch from API
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const res = await fetch(`${API_URL}/bills/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setBill(data.bill);
                } else {
                    console.error("Failed to fetch bill by ID");
                }
            } catch (err) {
                console.error("Error fetching bill details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBill();
    }, [id, bills]);

    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('autoDownload') === 'true' && bill && !loading) {
            // Short delay to ensure rendering is complete
            const timer = setTimeout(() => {
                handleDownload();
                // Remove the query param so it doesn't redownload on refresh
                navigate(location.pathname, { replace: true });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [location.search, bill, loading]);

    const handleDelete = async () => {
        if (!bill) return;
        if (window.confirm('Are you sure you want to delete this bill? This cannot be undone.')) {
            await deleteBill(bill.id);
            navigate('/bills');
        }
    };

    const handleDownload = async () => {
        if (!componentRef.current) return;

        try {
            setLoading(true);
            const element = componentRef.current;

            // Capture the element
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // To ensure it fits on ONE page, we scale it to A4 height if it's too long
            const a4Height = pdf.internal.pageSize.getHeight();
            let finalWidth = pdfWidth;
            let finalHeight = pdfHeight;

            if (pdfHeight > a4Height) {
                finalHeight = a4Height;
                finalWidth = (imgProps.width * finalHeight) / imgProps.height;
            }

            // Center horizontally if scaled down
            const xOffset = (pdfWidth - finalWidth) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
            pdf.save(`Invoice-${bill?.billNumber || 'Downloaded'}.pdf`);
            setLoading(false);
        } catch (err) {
            console.error('Download failed:', err);
            setLoading(false);
            alert('Failed to download PDF. Please try Print -> Save as PDF.');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Invoice ${bill?.billNumber}`,
                text: `Check out invoice ${bill?.billNumber} from ${bill?.customerName}`,
                url: window.location.href,
            })
                .catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!bill) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>Bill not found</Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/bills')}>
                    Back to Bills
                </Button>
            </Box>
        );
    }

    const handleWhatsAppShare = async () => {
        if (!bill) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/bills/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ billId: bill.id, method: 'whatsapp' })
            });

            if (!res.ok) {
                throw new Error('Failed to generate WhatsApp link');
            }

            const data = await res.json();
            if (data.whatsappUrl) {
                window.open(data.whatsappUrl, '_blank');
            } else {
                // Fallback: Create generic WhatsApp share link
                const text = `Invoice #${bill.billNumber}\nCustomer: ${bill.customerName}\nAmount: ${formatCurrency(bill.totalAmount)}\n\nView your invoice at: ${window.location.origin}/bills/view/${bill.id}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(whatsappUrl, '_blank');
            }
        } catch (e) {
            console.error('WhatsApp share error:', e);
            // Still provide fallback option
            const text = `Invoice #${bill.billNumber}\nCustomer: ${bill.customerName}\nAmount: ${formatCurrency(bill.totalAmount)}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
            {/* Header Actions */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                mb: 4,
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2
            }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/bills')}
                    variant="outlined"
                    fullWidth={false}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Back
                </Button>

                <Box sx={{
                    display: 'flex',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                }}>
                    <Button
                        startIcon={<SettingsIcon />}
                        variant="contained"
                        onClick={() => setTemplateDialogOpen(true)}
                        sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}
                    >
                        Template
                    </Button>
                    <Button
                        startIcon={<WhatsApp />}
                        variant="contained"
                        color="success"
                        onClick={handleWhatsAppShare}
                        sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}
                    >
                        WhatsApp
                    </Button>
                    <Button
                        startIcon={<Print />}
                        variant="outlined"
                        onClick={handlePrint}
                        sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}
                    >
                        Print
                    </Button>
                    <Button
                        startIcon={<Download />}
                        variant="outlined"
                        onClick={handleDownload}
                        sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}
                    >
                        PDF
                    </Button>
                    <Button
                        startIcon={<Delete />}
                        color="error"
                        variant="outlined"
                        onClick={handleDelete}
                        sx={{ borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            {/* Template Selector Dialog */}
            <Dialog
                open={templateDialogOpen}
                onClose={() => setTemplateDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Select Invoice Template</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        {MOCK_TEMPLATES.map((tmpl) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tmpl.id}>
                                <Card
                                    sx={{
                                        border: selectedTemplate.id === tmpl.id ? '2px solid' : '1px solid',
                                        borderColor: selectedTemplate.id === tmpl.id ? 'primary.main' : 'divider',
                                        boxShadow: selectedTemplate.id === tmpl.id ? 4 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <CardActionArea onClick={() => {
                                        setSelectedTemplate(tmpl);
                                        setTemplateDialogOpen(false);
                                    }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>{tmpl.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {tmpl.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>

            {/* Render with Selected Template */}
            <Box
                ref={componentRef}
                id="printable-invoice"
                className="print-fit-page"
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                    '@media print': {
                        overflow: 'hidden',
                        m: 0,
                        p: 0,
                    }
                }}
            >
                <BillTemplateRenderer template={selectedTemplate} bill={bill} />
            </Box>
        </Box>
    );
};

export default ViewBill;
