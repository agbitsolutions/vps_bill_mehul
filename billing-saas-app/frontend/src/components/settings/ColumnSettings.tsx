import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ColumnSettings: React.FC = () => {
    const [columns, setColumns] = useState<string[]>(['Product Name', 'Quantity', 'Price', 'Total']);
    const [customColumn, setCustomColumn] = useState<string>('');

    const handleAddColumn = () => {
        if (customColumn && !columns.includes(customColumn)) {
            setColumns([...columns, customColumn]);
            setCustomColumn('');
        }
    };

    const handleRemoveColumn = (column: string) => {
        setColumns(columns.filter(col => col !== column));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddColumn();
        }
    };

    return (
        <Box>
            <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="Add custom column"
                        placeholder="e.g., Discount, Tax, Notes"
                        value={customColumn}
                        onChange={(e) => setCustomColumn(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="small"
                        fullWidth
                    />
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={handleAddColumn}
                        disabled={!customColumn}
                    >
                        Add Column
                    </Button>
                </Stack>

                <Box>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Current Columns ({columns.length})
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {columns.map((column, index) => (
                            <Chip
                                key={index}
                                label={column}
                                onDelete={() => handleRemoveColumn(column)}
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

export default ColumnSettings;
