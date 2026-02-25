import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Link,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  Email,
  Person,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const signupSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(50, 'Name must be 50 characters or less'),
  email: z.string().email('Invalid email address'),
  phone: z.string().length(10, 'Phone must be exactly 10 digits').regex(/^\d+$/, 'Phone must contain only numbers'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  companyName: z.string().min(1, 'Company name is required'),
  organizationSize: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isLoading: isAuthLoading, login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  React.useEffect(() => {
    // If already logged in, redirect to home
    if (!isAuthLoading && localStorage.getItem('authToken')) {
      navigate('/');
    }
  }, [isAuthLoading, navigate]);

  const onSubmit = async (data: SignupFormData) => {
    setServerError('');
    setIsLoading(true);

    try {
      // Store organization info in localStorage for profile
      localStorage.setItem('organizationData', JSON.stringify({
        companyName: data.companyName,
        organizationSize: data.organizationSize,
        adminName: data.name,
        adminEmail: data.email,
        adminPhone: data.phone,
      }));

      await axios.post(`${API_URL}/auth/register`, {
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        name: data.name,
        phone: data.phone,
        organizationSize: data.organizationSize
      });

      // Auto-login after successful signup
      await login(data.email, data.password);
      navigate('/profile');
    } catch (err: any) {
      console.error('Registration Error:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create account.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
              <Business color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography component="h1" variant="h4" fontWeight="bold">BillSoft</Typography>
            </Box>

            <Typography component="h2" variant="h5" align="center" gutterBottom>Create Your Organization</Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Set up your B2B billing account. You'll be the first admin.
            </Typography>

            {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>Organization Details</Typography>

              <TextField
                margin="normal"
                required
                fullWidth
                label="Company / Organization Name"
                {...register('companyName')}
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><Business /></InputAdornment>),
                }}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Organization Size (e.g., 1-10, 50-100)"
                {...register('organizationSize')}
                error={!!errors.organizationSize}
                helperText={errors.organizationSize?.message}
                placeholder="Optional"
              />

              <Typography variant="subtitle2" sx={{ mb: 1, mt: 3, fontWeight: 600 }}>Admin Account (You)</Typography>

              <TextField
                margin="normal"
                required
                fullWidth
                label="Your Full Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Phone Number (10 digits)"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                placeholder="9876543210"
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><PhoneIcon /></InputAdornment>),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading || !isValid}
                size="large"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Divider sx={{ my: 2 }} />

              <Box textAlign="center">
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component="button" variant="body2" onClick={handleLoginRedirect} sx={{ cursor: 'pointer' }}>
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Signup;
