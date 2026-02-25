import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  Slider,
  Paper,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as PreviewIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Tune as TuneIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import A4InvoicePreview from './A4InvoicePreview';
import ClassicProfessionalPreview from './ClassicProfessionalPreview';
import MinimalCleanPreview from './MinimalCleanPreview';
import CorporateStandardPreview from './CorporateStandardPreview';
import CreativeModernPreview from './CreativeModernPreview';
import SimpleBasicPreview from './SimpleBasicPreview';
import { MOCK_TEMPLATES, InvoiceTemplate, TemplateField, TemplateSettings } from '../../constants/templates';

/**
 * Main Invoice Template Library Component
 * Handles template search, selection, preview, and customization
 */
const InvoiceTemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Dialog states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);

  // Tab state for settings
  const [settingsTab, setSettingsTab] = useState(0);

  // Template categories and complexities
  const categories = ['all', 'business', 'retail', 'service', 'consulting', 'healthcare', 'education'];
  const complexities = ['all', 'basic', 'standard', 'advanced'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, selectedComplexity, showFavoritesOnly]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setTemplates(MOCK_TEMPLATES);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Complexity filter
    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(template => template.complexity === selectedComplexity);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(template => template.isFavorite);
    }

    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = async (templateId: string) => {
    try {
      // In a real app, this would make an API call
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ defaultInvoiceTemplateId: templateId })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to update default template');
      // }

      // Update local state
      setTemplates(templates.map(template => ({
        ...template,
        isDefault: template.id === templateId
      })));

      // Show success message
      const selectedTemplate = templates.find(t => t.id === templateId);
      alert(`✅ Success! "${selectedTemplate?.name}" is now set as the default template. All new invoices will use this template.`);

    } catch (err) {
      console.error('Error updating default template:', err);
      setError('Failed to update default template. Please try again.');
    }
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      // In a real app, this would make an API call
      // const response = await fetch(`/api/templates/${templateId}/favorite`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isFavorite: !template.isFavorite })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to update favorite status');
      // }

      // Update local state
      setTemplates(templates.map(t =>
        t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
      ));

    } catch (err) {
      console.error('Error updating favorite status:', err);
    }
  };

  /**
   * Handle template download as PDF
   * Opens the template preview in print mode
   */
  const handleDownloadTemplate = (template: InvoiceTemplate) => {
    // Set the selected template and open preview
    setSelectedTemplate(template);
    setPreviewOpen(true);

    // After preview opens, trigger print dialog after a longer delay
    // This ensures the template is fully rendered and prevents layout changes
    // between consecutive print attempts
    setTimeout(() => {
      // Request animation frame to ensure DOM is fully updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 100);
      });
    }, 1200); // Increased to 1200ms for more reliable rendering
  };

  const handlePreview = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleEditSettings = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setSettingsOpen(true);
  };

  const handleEditFields = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setFieldsOpen(true);
  };

  const handleSaveSettings = async (settings: TemplateSettings) => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        throw new Error('Failed to save template settings');
      }

      // Update local state
      setTemplates(templates.map(t =>
        t.id === selectedTemplate.id ? { ...t, settings } : t
      ));

      setSettingsOpen(false);
    } catch (err) {
      console.error('Error saving template settings:', err);
      setError('Failed to save template settings. Please try again.');
    }
  };

  const handleSaveFields = async (fields: TemplateField[]) => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        throw new Error('Failed to save template fields');
      }

      // Update local state
      setTemplates(templates.map(t =>
        t.id === selectedTemplate.id ? { ...t, fields } : t
      ));

      setFieldsOpen(false);
    } catch (err) {
      console.error('Error saving template fields:', err);
      setError('Failed to save template fields. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading template library...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchTemplates}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📋 Invoice Template Library
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Browse, customize, and manage your invoice templates. Choose from {templates.length} professionally designed templates.
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
          gap: 3,
          alignItems: 'center'
        }}>
          <TextField
            fullWidth
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Complexity</InputLabel>
            <Select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              label="Complexity"
            >
              {complexities.map(complexity => (
                <MenuItem key={complexity} value={complexity}>
                  {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              />
            }
            label="Favorites Only"
          />

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => {/* Handle create new template */ }}
          >
            New Template
          </Button>
        </Box>
      </Paper>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3
        }}>
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              sx={{
                height: '100%',
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                }
              }}
            >
              {/* Template Actions */}
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(template.id);
                    }}
                    sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    {template.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                </Stack>
              </Box>

              {/* Default Badge */}
              {template.isDefault && (
                <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                  <Chip
                    label="Default"
                    size="small"
                    color="primary"
                    icon={<CheckIcon />}
                  />
                </Box>
              )}

              {/* Template Preview */}
              <CardMedia
                sx={{
                  height: 200,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  border: '2px dashed #e0e0e0',
                }}
                onClick={() => handlePreview(template)}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: template.settings.colorScheme,
                      borderRadius: 1,
                      mb: 1,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 'bold',
                    }}
                  >
                    {template.name.charAt(0)}
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {template.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.complexity.toUpperCase()} • {template.category.toUpperCase()}
                  </Typography>
                </Box>
              </CardMedia>

              <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>

                {/* Template Tags */}
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                    />
                  ))}
                  {template.tags.length > 3 && (
                    <Chip
                      label={`+${template.tags.length - 3} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 1,
                    width: '100%'
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PreviewIcon sx={{ fontSize: '1.2rem !important' }} />}
                    onClick={() => handlePreview(template)}
                    sx={{ justifyContent: 'center', px: 1 }}
                  >
                    Preview
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon sx={{ fontSize: '1.2rem !important' }} />}
                    onClick={() => handleDownloadTemplate(template)}
                    sx={{ justifyContent: 'center', px: 1 }}
                  >
                    Download
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SettingsIcon sx={{ fontSize: '1.2rem !important' }} />}
                    onClick={() => handleEditSettings(template)}
                    sx={{ justifyContent: 'center', px: 1 }}
                  >
                    Settings
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TuneIcon sx={{ fontSize: '1.2rem !important' }} />}
                    onClick={() => handleEditFields(template)}
                    sx={{ justifyContent: 'center', px: 1 }}
                  >
                    Fields
                  </Button>
                </Box>

                {/* Set as Default Button */}
                {!template.isDefault && (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || selectedCategory !== 'all' || selectedComplexity !== 'all' || showFavoritesOnly
              ? 'No templates match your current filters'
              : 'No templates available'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || selectedCategory !== 'all' || selectedComplexity !== 'all' || showFavoritesOnly
              ? 'Try adjusting your search criteria or filters to find more templates.'
              : 'Create your first template or check back later for new additions.'
            }
          </Typography>
          {(searchTerm || selectedCategory !== 'all' || selectedComplexity !== 'all' || showFavoritesOnly) && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedComplexity('all');
                setShowFavoritesOnly(false);
              }}
            >
              Clear All Filters
            </Button>
          )}
        </Paper>
      )}      {/* Template Preview Dialog */}
      <TemplatePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={selectedTemplate}
        onSelect={handleTemplateSelect}
      />

      {/* Template Settings Dialog */}
      <TemplateSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        template={selectedTemplate}
        onSave={handleSaveSettings}
      />

      {/* Template Fields Dialog */}
      <TemplateFieldsDialog
        open={fieldsOpen}
        onClose={() => setFieldsOpen(false)}
        template={selectedTemplate}
        onSave={handleSaveFields}
      />
    </Box>
  );
};

/**
 * Template Preview Dialog Component
 */
interface TemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  template: InvoiceTemplate | null;
  onSelect: (templateId: string) => void;
}

const TemplatePreviewDialog: React.FC<TemplatePreviewDialogProps> = ({
  open,
  onClose,
  template,
  onSelect,
}) => {
  const [isReady, setIsReady] = React.useState(false);
  const [renderKey, setRenderKey] = React.useState(0);

  // Increment renderKey every time dialog opens to force fresh render
  React.useEffect(() => {
    if (open) {
      setRenderKey(prev => prev + 1);
    }
  }, [open]);

  // Reset ready state when template changes or dialog opens/closes
  React.useEffect(() => {
    if (open && template) {
      // Reset state first
      setIsReady(false);
      // Give React time to render the component fully
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
      return () => {
        clearTimeout(timer);
        // Cleanup: reset state when unmounting or closing
        setIsReady(false);
      };
    } else {
      // Always reset when dialog is closed
      setIsReady(false);
    }
  }, [open, template]);

  // Add print-specific styling when printing
  React.useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add('printing');
    };

    const handleAfterPrint = () => {
      document.body.classList.remove('printing');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  if (!template) return null;

  const isDefaultTemplate = template.isDefault;

  return (
    <Dialog
      key={`${template.id}-${renderKey}`}
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: '#fff',
          '@media print': {
            maxWidth: 'none',
            margin: 0,
            boxShadow: 'none',
            border: 'none',
          }
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: '#ffffff',
          opacity: '1 !important',
        }
      }}
      sx={{
        zIndex: 9999,
        '& .MuiBackdrop-root': {
          backgroundColor: '#ffffff',
          opacity: '1 !important',
        }
      }}
    >
      <DialogTitle
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          '@media print': { display: 'none' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              Preview: {template.name}
            </Typography>
            {isDefaultTemplate && (
              <Chip
                label="Currently In Use"
                color="success"
                size="small"
                icon={<CheckIcon />}
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ ml: 2 }}>
            <Box component="span" sx={{ fontSize: '1.5rem' }}>×</Box>
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f5f5f5',
        overflow: 'auto',
        '@media print': {
          padding: 0,
          overflow: 'visible',
          backgroundColor: 'transparent',
        }
      }}>
        <Box sx={{
          display: 'none',
          '@media print': { display: 'none' }
        }}>
          <Typography variant="body1" gutterBottom>
            {template.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`${template.complexity.charAt(0).toUpperCase() + template.complexity.slice(1)} Complexity`}
              color="primary"
              size="small"
            />
            <Chip
              label={template.category.charAt(0).toUpperCase() + template.category.slice(1)}
              color="secondary"
              size="small"
            />
            {template.isDefault && (
              <Chip label="Default Template" color="success" size="small" />
            )}
            {template.isFavorite && (
              <Chip label="★ Favorite" color="warning" size="small" />
            )}
          </Box>
          <Box sx={{ mb: 2 }}>
            {template.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
          </Box>
        </Box>

        {/* ALWAYS show Template-Specific Preview Components */}
        <Box sx={{
          width: '100%',
          maxWidth: '210mm',
          margin: '20px auto',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          '@media print': {
            maxWidth: 'none',
            width: '100%',
            margin: 0,
            padding: 0,
            minHeight: 'auto',
            backgroundColor: 'transparent',
          }
        }}>
          {isDefaultTemplate && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              '@media print': { display: 'none' }
            }}>
              <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon /> Live Preview - Currently Active Template
              </Typography>
            </Box>
          )}
          {/* Render appropriate preview component based on template */}
          {template.name === 'Modern Business' && <A4InvoicePreview template={template} />}
          {template.name === 'Classic Professional' && <ClassicProfessionalPreview template={template} />}
          {template.name === 'Minimal Clean' && <MinimalCleanPreview template={template} />}
          {template.name === 'Corporate Standard' && <CorporateStandardPreview template={template} />}
          {template.name === 'Creative Modern' && <CreativeModernPreview template={template} />}
          {template.name === 'Simple Basic' && <SimpleBasicPreview template={template} />}
          {/* ALWAYS render A4InvoicePreview for all other templates (Retail Invoice, Service Provider, etc.) */}
          {!['Modern Business', 'Classic Professional', 'Minimal Clean', 'Corporate Standard', 'Creative Modern', 'Simple Basic'].includes(template.name) && (
            <A4InvoicePreview template={template} />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '16px 24px',
        '@media print': { display: 'none' }
      }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        <Button
          startIcon={<DownloadIcon />}
          variant="outlined"
          onClick={() => {
            // Access the parent component's handleDownloadTemplate function
            // For now, we'll inline the download logic
            const printWindow = window.open('', '_blank');
            if (printWindow && template) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Invoice Template - ${template.name}</title>
                    <style>
                      body { font-family: Arial, sans-serif; margin: 20px; }
                      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                      .template-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                      .fields-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
                      .field-item { background: white; padding: 10px; border: 1px solid #ddd; border-radius: 3px; }
                      @media print { body { margin: 0; } }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <h1>${template.name} Template</h1>
                      <p>${template.description}</p>
                    </div>
                    <div class="template-info">
                      <h3>Template Configuration</h3>
                      <p><strong>Category:</strong> ${template.category}</p>
                      <p><strong>Complexity:</strong> ${template.complexity}</p>
                      <p><strong>Fields:</strong> ${template.fields.length} total</p>
                    </div>
                    <div class="fields-section">
                      <h3>Available Fields</h3>
                      <div class="fields-grid">
                        ${template.fields.map(field => `
                          <div class="field-item">
                            <strong>${field.name}</strong><br>
                            ${field.type} • ${field.required ? 'Required' : 'Optional'}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
            }
          }}
        >
          Download
        </Button>
        {!template.isDefault && (
          <Button
            variant="contained"
            onClick={() => {
              onSelect(template.id);
              onClose();
            }}
          >
            Set as Default
          </Button>
        )}
        {template.isDefault && (
          <Typography variant="body2" color="success.main" sx={{ mr: 2 }}>
            This template is currently active for all new invoices
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
};

/**
 * Template Settings Dialog Component
 */
interface TemplateSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  template: InvoiceTemplate | null;
  onSave: (settings: TemplateSettings) => void;
}

const TemplateSettingsDialog: React.FC<TemplateSettingsDialogProps> = ({
  open,
  onClose,
  template,
  onSave,
}) => {
  const [settings, setSettings] = useState<TemplateSettings | null>(null);

  useEffect(() => {
    if (template) {
      setSettings({ ...template.settings });
    }
  }, [template]);

  if (!template || !settings) return null;

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Template Settings: {template.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3
          }}>
            <FormControl fullWidth>
              <InputLabel>Logo Position</InputLabel>
              <Select
                value={settings.logoPosition}
                onChange={(e) => setSettings({
                  ...settings,
                  logoPosition: e.target.value as any
                })}
                label="Logo Position"
              >
                <MenuItem value="top-left">Top Left</MenuItem>
                <MenuItem value="top-center">Top Center</MenuItem>
                <MenuItem value="top-right">Top Right</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Color Scheme"
              value={settings.colorScheme}
              onChange={(e) => setSettings({
                ...settings,
                colorScheme: e.target.value
              })}
            />

            <TextField
              fullWidth
              label="Font Family"
              value={settings.fontFamily}
              onChange={(e) => setSettings({
                ...settings,
                fontFamily: e.target.value
              })}
            />

            <Box>
              <Typography gutterBottom>Font Size: {settings.fontSize}px</Typography>
              <Slider
                value={settings.fontSize}
                onChange={(_, value) => setSettings({
                  ...settings,
                  fontSize: value as number
                })}
                min={8}
                max={24}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showBorder}
                  onChange={(e) => setSettings({
                    ...settings,
                    showBorder: e.target.checked
                  })}
                />
              }
              label="Show Border"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Template Fields Dialog Component
 */
interface TemplateFieldsDialogProps {
  open: boolean;
  onClose: () => void;
  template: InvoiceTemplate | null;
  onSave: (fields: TemplateField[]) => void;
}

const TemplateFieldsDialog: React.FC<TemplateFieldsDialogProps> = ({
  open,
  onClose,
  template,
  onSave,
}) => {
  const [fields, setFields] = useState<TemplateField[]>([]);

  useEffect(() => {
    if (template) {
      setFields([...template.fields]);
    }
  }, [template]);

  if (!template) return null;

  const handleFieldUpdate = (index: number, updates: Partial<TemplateField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const handleSave = () => {
    onSave(fields);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Template Fields: {template.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <List>
            {fields.map((field, index) => (
              <ListItem key={field.id} divider>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto auto auto' },
                  gap: 2,
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {field.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {field.type}
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="Custom Label"
                    value={field.customLabel || ''}
                    onChange={(e) => handleFieldUpdate(index, { customLabel: e.target.value })}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.visible}
                        onChange={(e) => handleFieldUpdate(index, { visible: e.target.checked })}
                      />
                    }
                    label="Visible"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.required}
                        onChange={(e) => handleFieldUpdate(index, { required: e.target.checked })}
                      />
                    }
                    label="Required"
                  />

                  <TextField
                    size="small"
                    type="number"
                    label="Position"
                    value={field.position}
                    onChange={(e) => handleFieldUpdate(index, { position: parseInt(e.target.value) })}
                    sx={{ width: 100 }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Fields
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceTemplateLibrary;
