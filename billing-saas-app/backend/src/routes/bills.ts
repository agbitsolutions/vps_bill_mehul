import express from 'express'
import prisma from '../lib/prisma'
import { extractUserFromRequest } from '../lib/auth'
import { createAdminSettingsService } from '../services/AdminSettingsService'
import { autoSendInvoice } from '../services/whatsappService'
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

// Helper function to generate bill number
const generateBillNumber = (): string => {
  const prefix = 'INV'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Get all bills
router.get('/', authenticateUser, async (req: any, res) => {
  try {
    const { search, status, customerId, page = 1, limit = 50 } = req.query
    const userId = req.user.userId

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const whereClause: any = { userId }

    if (search) {
      whereClause.OR = [
        { billNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } }
      ]
    }

    if (status) {
      whereClause.status = status.toUpperCase()
    }

    if (customerId) {
      whereClause.customerId = customerId
    }

    // Optimize: only fetch what's needed for the list
    const [bills, total] = await Promise.all([
      (prisma.bill as any).findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      (prisma.bill as any).count({ where: whereClause })
    ])

    res.status(200).json({
      bills,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error) {
    console.error('Get bills error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create bill
router.post('/', authenticateUser, async (req: any, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      items,
      status,
      dueDate,
      notes,
      templateId,
      paidAmount = 0,
      redeemPoints = false,
      branchId,
      supplierId
    } = req.body
    const userId = req.user.userId

    if (!customerId || !customerName || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Customer ID, customer name, and items are required'
      })
    }

    // Start Transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Validate all products and stock first (Batch check for performance)
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds }, userId }
      });

      const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));
      let subtotal = 0;

      // 2. Process items and Check stock
      for (const item of items) {
        const product: any = productMap.get(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productName}`);

        if (product.stock !== null && product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName}. Available: ${product.stock}`);
        }

        // Accumulate subtotal
        subtotal += item.total;
      }

      // 3. Subtract Sold Units (Null-safe decrement and check for alerts)
      const lowStockAlerts = [];
      for (const item of items) {
        const product: any = productMap.get(item.productId);

        // Ensure stock isn't completely null before decrementing
        const newStock = product.stock !== null
          ? Math.max(0, product.stock - Math.round(item.quantity))
          : null;

        if (newStock !== null) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock }
          });

          if (updatedProduct && updatedProduct.stock !== null && updatedProduct.stock <= 10) {
            lowStockAlerts.push({
              name: updatedProduct.name,
              stock: updatedProduct.stock
            });
          }
        }
      }

      const requestedTaxAmount = req.body.taxAmount !== undefined ? Number(req.body.taxAmount) : (subtotal * 0.18);
      const taxAmount = requestedTaxAmount;
      let totalAmount = subtotal + taxAmount;

      // 4. Handle Loyalty Points (Redeem)
      let discountAmount = 0;
      const customer = await tx.customer.findUnique({ where: { id: customerId } });

      if (redeemPoints && customer && (customer as any).loyaltyPoints && (customer as any).loyaltyPoints > 0) {
        const maxRedeemable = Math.min((customer as any).loyaltyPoints, totalAmount * 0.10);
        discountAmount = maxRedeemable;
        totalAmount -= discountAmount;

        await tx.customer.update({
          where: { id: customerId },
          data: { loyaltyPoints: { decrement: maxRedeemable } }
        });
      }

      // 5. Handle Payments
      const isPaidRequest = status && status.toString().toUpperCase() === 'PAID';
      const amountPaid = isPaidRequest ? totalAmount : (Number(paidAmount) || 0);
      const dueAmount = Math.max(0, totalAmount - amountPaid);

      let paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
      if (amountPaid >= totalAmount) paymentStatus = 'PAID';
      else if (amountPaid > 0) paymentStatus = 'PARTIAL';

      const billStatus = status === 'DRAFT' ? 'DRAFT' : (paymentStatus === 'PAID' ? 'PAID' : 'PENDING');

      // 6. Earn New Points
      const pointsEarned = Math.floor(totalAmount / 100);
      if (customer) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            loyaltyPoints: { increment: pointsEarned }
          }
        });
      }

      // 7. Create Bill
      const billNumber = generateBillNumber();
      const adminSettingsService = createAdminSettingsService(prisma as any);
      const defaultTemplate = templateId || await adminSettingsService.getDefaultTemplate();

      const newBill = await tx.bill.create({
        data: {
          userId,
          customerId,
          billNumber,
          customerName,
          customerEmail: customerEmail || null,
          status: billStatus,
          paymentStatus,
          paidAmount: amountPaid,
          dueAmount,
          subtotal,
          taxAmount,
          totalAmount,
          templateId: defaultTemplate,
          dueDate: dueDate ? new Date(dueDate) : null,
          notes: notes || `Points Earned: ${pointsEarned}`,
          branchId: branchId || null,
          supplierId: supplierId || null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: Math.round(item.quantity) || 1,
              price: item.price,
              total: item.total
            }))
          }
        },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      // 8. Update Supplier Balance if linked
      if (supplierId) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: {
            balance: {
              increment: totalAmount
            }
          }
        });
      }

      // 9. Create Audit Log
      await recordAuditLog({
        prismaClient: tx,
        userId,
        action: 'CREATE',
        entity: 'Bill',
        entityId: newBill.id,
        description: `Bill #${newBill.billNumber} created`,
        req,
        newData: { billNumber, totalAmount, customerName }
      });

      // 10. Notifications are now dynamically pulled by the frontend from /api/inventory/alerts
      // We no longer manually create persistent Notification table rows here so they don't block the UI deduplication.

      return { bill: newBill, pointsEarned, discountAmount };
    });

    // 10. Fire-and-forget WhatsApp (Non-blocking for "Instant" feel)
    const bill: any = result.bill;
    if (bill.customer?.phone) {
      const appUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
      autoSendInvoice(
        bill.id,
        bill.customer.phone,
        bill.billNumber || bill.id.slice(0, 8),
        bill.customerName,
        bill.totalAmount,
        appUrl
      ).catch(err => console.error('Background WhatsApp send failed:', err));
    }

    res.status(201).json({
      message: 'Bill created successfully',
      bill: result.bill,
      pointsEarned: result.pointsEarned,
      discountAmount: result.discountAmount
    });

  } catch (error: any) {
    console.error('Create bill error:', error);
    res.status(400).json({ error: error.message || 'Internal server error' })
  }
})

// Get, Update, Delete similar to other routes...
router.get('/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const bill = await (prisma.bill as any).findFirst({
      where: { id, userId },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
          }
        }
      }
    })

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' })
    }

    res.status(200).json({ bill })
  } catch (error) {
    console.error('Get bill error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params
    const {
      customerId,
      customerName,
      customerEmail,
      items,
      status,
      dueDate,
      notes
    } = req.body
    const userId = req.user.userId

    if (!customerId || !customerName || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Customer ID, customer name, and items are required'
      })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0)
    const taxAmount = subtotal * 0.18
    const totalAmount = subtotal + taxAmount

    // Delete existing items
    await prisma.billItem.deleteMany({
      where: { billId: id }
    })

    // Update bill and create new items
    const bill = await prisma.bill.update({
      where: { id },
      data: {
        customerId,
        customerName,
        customerEmail: customerEmail || null,
        status: status?.toUpperCase() || 'DRAFT',
        subtotal,
        taxAmount,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          }))
        }
      },
      include: {
        items: true
      }
    })

    res.status(200).json({
      message: 'Bill updated successfully',
      bill
    })
  } catch (error: any) {
    console.error('Update bill error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Bill not found' })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Start Transaction to restore stock before deletion
    await prisma.$transaction(async (tx) => {
      // 1. Get all items in the bill to restore stock
      const bill = await tx.bill.findUnique({
        where: { id, userId },
        include: { items: true }
      });

      if (!bill) {
        throw new Error('Bill not found');
      }

      /*
      // 2. Restore stock for each item - DISABLED as per user request
      for (const item of bill.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }
      }
      */

      // 3. Delete bill items
      await tx.billItem.deleteMany({
        where: { billId: id }
      });

      // 4. Delete the bill
      const deleteResult = await tx.bill.delete({
        where: { id, userId }
      });

      // 5. Audit Log (using helper with transaction)
      // Strip any complex objects/dates to ensure JSON.stringify doesn't throw inside auditLog.ts
      await recordAuditLog({
        prismaClient: tx,
        userId,
        action: 'DELETE',
        entity: 'Bill',
        entityId: id,
        description: `Bill #${bill.billNumber} deleted`,
        newData: {
          billNumber: bill.billNumber,
          totalAmount: Number(bill.totalAmount)
        }
      });

      return deleteResult;
    });

    res.status(200).json({ message: 'Bill deleted successfully' })
  } catch (error) {
    console.error('Delete bill error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
