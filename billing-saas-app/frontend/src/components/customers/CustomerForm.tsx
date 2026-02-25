import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Customer } from '../../types/customer';
import { useCustomers } from '../../hooks/useCustomers';

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(50, 'Name must be 50 characters or less'),
  email: z.string().email('Invalid email address'),
  phone: z.string().length(10, 'Phone must be exactly 10 digits').regex(/^\d+$/, 'Phone must contain only numbers').optional().or(z.literal('')),
  address: z.string().optional(),
  dob: z.string().optional(),
  anniversaryDate: z.string().optional()
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onClose: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose }) => {
  const { createCustomer, updateCustomer } = useCustomers();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      dob: customer?.dob ? new Date(customer.dob).toISOString().split('T')[0] : '',
      anniversaryDate: customer?.anniversaryDate ? new Date(customer.anniversaryDate).toISOString().split('T')[0] : ''
    }
  });

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    setServerError(null);

    try {
      const customerData = {
        ...data,
        phone: data.phone || '',
        dob: data.dob ? new Date(data.dob).toISOString() : null,
        anniversaryDate: data.anniversaryDate ? new Date(data.anniversaryDate).toISOString() : null
      };

      if (customer) {
        const updatedCustomer: Customer = {
          ...customer,
          ...customerData,
          updatedAt: new Date().toISOString()
        };
        await updateCustomer(updatedCustomer);
      } else {
        await createCustomer(customerData);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || 'Failed to save customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Customer Name"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
          required
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          required
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Phone Number (10 digits)"
          {...register('phone')}
          error={!!errors.phone}
          helperText={errors.phone?.message as string}
          disabled={loading}
          placeholder="9876543210"
        />

        <TextField
          fullWidth
          label="Address"
          multiline
          rows={3}
          {...register('address')}
          error={!!errors.address}
          helperText={errors.address?.message}
          disabled={loading}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            {...register('dob')}
            error={!!errors.dob}
            helperText={errors.dob?.message}
          />
          <TextField
            fullWidth
            label="Anniversary Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            {...register('anniversaryDate')}
            error={!!errors.anniversaryDate}
            helperText={errors.anniversaryDate?.message}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isValid}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : customer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerForm;
