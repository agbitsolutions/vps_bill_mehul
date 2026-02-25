
import express from 'express'
import prisma from '../lib/prisma'
import { extractUserFromRequest } from '../lib/auth'
import { recordAuditLog } from '../lib/auditLog'

const router = express.Router()

// Middleware to authenticate requests
const authenticateUser = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization
  const user = extractUserFromRequest(authHeader)

  if (!user) {
    return res.status(401).json({ error: 'Authorization required' })
  }

  req.user = user
  next()
}

// Get all products
router.get('/', authenticateUser, async (req: any, res) => {
  try {
    const { search } = req.query
    const userId = req.user.userId

    const whereClause: any = { userId }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search } }
      ]
    }

    const products = await (prisma.product as any).findMany({
      where: whereClause,
      include: {
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.status(200).json({ products })

  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create product
router.post('/', authenticateUser, async (req: any, res) => {
  try {
    const { name, description, price, taxRate, stock, category, sku, supplierId } = req.body
    const userId = req.user.userId

    console.log('Creating product for user:', userId);
    console.log('Payload:', req.body);

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' })
    }

    if (price === undefined || price === null || isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number or zero' })
    }

    const product = await prisma.product.create({
      data: {
        userId,
        name,
        description: description || null,
        price: parseFloat(price),
        taxRate: taxRate ? parseFloat(taxRate) : 0,
        stock: stock ? parseInt(stock) : 0,
        category: category || null,
        sku: sku || null,
        supplierId: supplierId || null
      } as any
    })

    // Audit Log: Create
    await recordAuditLog({
      userId,
      action: 'CREATE',
      entity: 'Product',
      entityId: product.id,
      description: `Product: ${product.name} created`,
      req, // Pass request for IP
      newData: { name: product.name, price: product.price, stock: product.stock }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    })

  } catch (error: any) {
    console.error('Create product error:', error)

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Product with this SKU already exists' })
    }

    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'User session invalid. Please log out and log in again.' })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get, Update, Delete product routes similar to customers...
router.get('/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const product = await (prisma.product as any).findFirst({
      where: { id, userId },
      include: { supplier: true }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.status(200).json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params
    const { name, description, price, taxRate, stock, category, sku, supplierId } = req.body
    const userId = req.user.userId

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' })
    }

    if (price === undefined || price === null || isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number or zero' })
    }

    const result = await prisma.product.updateMany({
      where: { id, userId },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        taxRate: taxRate ? parseFloat(taxRate) : 0,
        stock: stock ? parseInt(stock) : 0,
        category: category || null,
        sku: sku || null,
        supplierId: supplierId || null
      } as any
    })

    if (result.count === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = await prisma.product.findFirst({
      where: { id, userId }
    })

    res.status(200).json({
      message: 'Product updated successfully',
      product
    })
  } catch (error: any) {
    console.error('Update product error:', error)

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Product with this SKU already exists' })
    }

    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'User not found or database sync issue. Please reload and log in again.' })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Fetch product before deletion for audit log
    const product = await (prisma.product as any).findFirst({
      where: { id, userId }
    });

    const result = await prisma.product.deleteMany({
      where: { id, userId }
    })

    if (result.count === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Audit Log: Delete
    if (product) {
      await recordAuditLog({
        userId,
        action: 'DELETE',
        entity: 'Product',
        entityId: id,
        description: `Product: ${product.name} deleted`,
        req, // Pass request for IP
        oldData: { name: product.name, price: product.price }
      });
    }

    res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    console.error('Delete product error:', error)

    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete product with existing bill items' })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
