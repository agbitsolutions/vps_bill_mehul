import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import customerRoutes from './routes/customers'
import productRoutes from './routes/products'
import billRoutes from './routes/bills'
import adminRoutes from './routes/admin'
import supplierRoutes from './routes/suppliers'
import expenseRoutes from './routes/expenses'
import inventoryRoutes from './routes/inventory'

// Load environment variables
dotenv.config()
// Also load .env.local for local development overrides
dotenv.config({ path: '.env.local', override: true })


const app = express()
const PORT: number = Number(process.env.SERVER_PORT) || 5003


// Enable CORS for all environments
const allowedOrigins = [
  'http://localhost:3003',
  'http://localhost:3001',
  'http://localhost:5003',
  'https://billsoft-web.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    // Allow whitelisted origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-version', 'timezone', 'cache-control', 'pragma', 'expires', 'x-client']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.body && Object.keys(req.body).length > 0) {
    // Sanitize passwords in logs
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log('Body:', JSON.stringify(sanitizedBody));
  }
  next();
});

// Debug Database URL
console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'SET' : 'MISSING');
console.log('DEBUG: Current Directory:', process.cwd());
try {
  const fs = require('fs');
  const path = require('path');
  const prismaPath = path.join(process.cwd(), 'prisma/dev.db');
  if (fs.existsSync(prismaPath)) {
    console.log('DEBUG: SQLite DB exists at', prismaPath);
    try {
      fs.accessSync(prismaPath, fs.constants.R_OK | fs.constants.W_OK);
      console.log('DEBUG: SQLite DB is READABLE and WRITABLE');
    } catch (err) {
      console.error('DEBUG: SQLite DB Permission Error:', err);
    }
  } else {
    console.log('DEBUG: SQLite DB NOT found at', prismaPath);
  }
} catch (e) {
  console.error('DEBUG: File check error:', e);
}

// Health check (available at both root and /api)
const healthHandler = (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', message: 'BillSoft API Server is running' })
};
app.get('/health', healthHandler)
app.get('/api/health', healthHandler)

// Root and API Info routes
const rootHandler = (req: express.Request, res: express.Response) => {
  res.json({
    message: 'BillSoft API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      customers: '/api/customers',
      products: '/api/products',
      bills: '/api/bills',
      suppliers: '/api/suppliers',
      expenses: '/api/expenses'
    },
    availableEndpoints: [
      'GET /api/auth/me',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/customers',
      'POST /api/customers',
      'GET /api/products',
      'POST /api/products',
      'GET /api/bills',
      'POST /api/bills',
      'GET /api/suppliers',
      'POST /api/suppliers',
      'GET /api/admin/tax',
      'POST /api/admin/tax',
      'GET /api/admin/settings',
      'POST /api/admin/settings',
      'GET /api/admin/feature-flags',
      'POST /api/admin/feature-flags',
      'GET /api/expenses',
      'POST /api/expenses'
    ]
  })
};
app.get('/', rootHandler)
app.get('/api', rootHandler)

// API Routes
const modules = [
  { path: 'auth', routes: authRoutes },
  { path: 'customers', routes: customerRoutes },
  { path: 'products', routes: productRoutes },
  { path: 'bills', routes: billRoutes },
  { path: 'admin', routes: adminRoutes },
  { path: 'suppliers', routes: supplierRoutes },
  { path: 'expenses', routes: expenseRoutes },
  { path: 'inventory', routes: inventoryRoutes }
];

modules.forEach(m => {
  app.use(`/api/${m.path}`, m.routes);
  app.use(`/${m.path}`, m.routes);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('🚀 BillSoft API Server started successfully!')
  console.log(`📡 Server running on: http://0.0.0.0:${PORT}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/health`)
  console.log(`📋 API Base URL: http://localhost:${PORT}/api`)
  console.log('')
  console.log('Available endpoints:')
  console.log('  🔐 Auth: /api/auth/{register,login,profile}')
  console.log('  👥 Customers: /api/customers')
  console.log('  📦 Products: /api/products')
  console.log('  🧾 Bills: /api/bills')
  console.log('  🏢 Suppliers: /api/suppliers')
  console.log('  ⚙️  Admin: /api/admin/{tax,settings,feature-flags}')
  console.log('')
})
