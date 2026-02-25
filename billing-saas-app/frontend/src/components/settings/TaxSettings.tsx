import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TaxSettings: React.FC = () => {
    const [taxSlots, setTaxSlots] = useState<{ name: string; rate: number }[]>([{ name: '', rate: 0 }]);

    const handleTaxSlotChange = (index: number, field: 'name' | 'rate', value: string | number) => {
        const updatedSlots = [...taxSlots];
        if (field === 'name') {
            updatedSlots[index].name = value as string;
        } else {
            updatedSlots[index].rate = Number(value);
        }
        setTaxSlots(updatedSlots);
    };

    const addTaxSlot = () => {
        setTaxSlots([...taxSlots, { name: '', rate: 0 }]);
    };

    const removeTaxSlot = (index: number) => {
        if (taxSlots.length > 1) {
            setTaxSlots(taxSlots.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit tax settings to the server or handle accordingly
        console.log('Tax settings submitted:', taxSlots);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                {taxSlots.map((slot, index) => (
                    <Paper key={index} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                label="Tax Name"
                                placeholder="e.g., GST, VAT, Sales Tax"
                                value={slot.name}
                                onChange={(e) => handleTaxSlotChange(index, 'name', e.target.value)}
                                size="small"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Tax Rate (%)"
                                type="number"
                                placeholder="0"
                                value={slot.rate}
                                onChange={(e) => handleTaxSlotChange(index, 'rate', e.target.value)}
                                size="small"
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                sx={{ width: 150 }}
                                required
                            />
                            <IconButton 
                                color="error" 
                                onClick={() => removeTaxSlot(index)}
                                disabled={taxSlots.length === 1}
                                aria-label="Remove tax"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </Paper>
                ))}
                
                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        onClick={addTaxSlot}
                    >
                        Add Tax Slot
                    </Button>
                    <Button 
                        variant="contained" 
                        type="submit"
                    >
                        Save Tax Settings
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default TaxSettings;
