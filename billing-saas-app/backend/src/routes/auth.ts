import express from 'express'
import prisma from '../lib/prisma'
import { hashPassword, verifyPassword, createAuthResponse } from '../lib/auth'
import { z } from 'zod';

const router = express.Router()

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  companyName: z.string().min(1, 'Company name is required'),
  name: z.string().max(50, 'Name must be 50 characters or less').optional(),
  phone: z.string().length(10, 'Phone must be exactly 10 digits').regex(/^\d+$/, 'Phone must contain only numbers').optional(),
  organizationSize: z.string().optional()
});

// Auth API Information
router.get('/', (req, res) => {
  res.json({
    message: 'Authentication API',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      organizationLogin: 'POST /organization-login',
      profile: 'GET /profile'
    }
  })
})

// Register
router.post('/register', async (req, res) => {
  console.log('--- SIGNUP ATTEMPT ---')
  console.log('Payload:', JSON.stringify({ ...req.body, password: '***' }))

  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, companyName, name, phone } = validatedData;

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    console.log('Checking for existing user:', normalizedEmail)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      console.log('User already exists:', normalizedEmail)
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await hashPassword(password)

    // Create user with explicit defaults
    console.log('Creating user in database...')
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        companyName: companyName,
        name: name || null,
        phone: phone || null,
        planType: 'FREE'
      }
    })

    console.log('User created successfully:', user.id)
    const authResponse = createAuthResponse(user)

    return res.status(201).json({
      message: 'User created successfully',
      ...authResponse
    })

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.issues.map((e: any) => e.message).join(', ')
      });
    }

    console.error('CRITICAL REGISTRATION ERROR:', err)

    if (err.code === 'P2002') {
      return res.status(400).json({
        error: 'User already exists with this email',
        detail: 'Unique constraint failed on email'
      })
    }

    return res.status(500).json({
      error: 'Registration failed',
      detail: err.message,
      code: err.code
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    // Find user by email
    console.log('Login attempt for:', normalizedEmail);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      console.log('Login failed: User not found', normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const authResponse = createAuthResponse(user)

    res.status(200).json({
      message: 'Login successful',
      ...authResponse
    })

  } catch (err: any) {
    console.error('Login error:', err)
    res.status(500).json({ detail: err.message })
  }
})

// Organization Login
router.post('/organization-login', async (req, res) => {
  try {
    const { email, password, organizationCode } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      console.log('Login attempt failed: User not found', normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify Organization Access
    if (!user.companyName) {
      return res.status(403).json({
        error: 'Access denied. This account is not associated with an organization.'
      })
    }

    // Optional: Verify organization code if provided (future enhancement)
    if (organizationCode && user.companyName !== organizationCode) {
      // logic for code verification if user.companyCode existed
    }

    const authResponse = createAuthResponse(user)

    res.status(200).json({
      message: `Welcome to ${user.companyName}`,
      organization: {
        name: user.companyName,
        logoUrl: user.logoUrl,
        plan: user.planType
      },
      ...authResponse
    })

  } catch (err: any) {
    console.error('Organization login error:', err)
    res.status(500).json({ detail: err.message })
  }
})

// Get Profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const token = authHeader.substring(7)
    const { extractUserFromRequest } = await import('../lib/auth')
    const user = extractUserFromRequest(authHeader)

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Get user profile from database
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        companyName: true,
        logoUrl: true,
        createdAt: true
      }
    })

    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({ user: userProfile })

  } catch (err: any) {
    console.error('Profile error:', err)
    res.status(500).json({ detail: err.message })
  }
})

export default router
