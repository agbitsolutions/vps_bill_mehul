import express from 'express'
import prisma from '../lib/prisma'
import { extractUserFromRequest } from '../lib/auth'

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

// Get inventory alerts and notifications
router.get('/alerts', authenticateUser, async (req: any, res: any) => {
    try {
        const userId = req.user.userId

        // 1. Low Stock Alerts
        const lowStockProducts = await prisma.product.findMany({
            where: {
                userId,
                stock: {
                    lte: 10 // Threshold <= 10
                }
            },
            select: {
                id: true,
                name: true,
                stock: true,
                minStockLevel: true
            },
            take: 100 // Increased limit to ensure badge count is accurate
        })

        // 2. Recent Bills (Notifications)
        // Fetch bills created in the last 24 hours
        const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)

        const recentBills = await prisma.bill.findMany({
            where: {
                userId,
                createdAt: {
                    gte: oneDayAgo
                },
                isNotificationRead: false // Strict filtering: Exclude read notifications
            },
            select: {
                id: true,
                billNumber: true,
                customerName: true,
                totalAmount: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Increased limit for accurate badge count
        })

        // 3. Persistent Notifications
        const notifications = await (prisma as any).notification.findMany({
            where: {
                userId,
                isRead: false
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        res.status(200).json({
            lowStock: lowStockProducts.map((p: any) => ({
                id: p.id,
                name: p.name,
                stock: p.stock,
                minStockLevel: p.minStockLevel,
                type: 'stock'
            })),
            recentBills: recentBills.map((b: any) => ({
                id: b.id,
                name: `New bill generated: #${b.billNumber || b.id.slice(0, 8)}`,
                amount: b.totalAmount,
                date: b.createdAt,
                type: 'bill'
            })),
            notifications: notifications.map((n: any) => ({
                id: n.id,
                name: n.message,
                type: n.type,
                date: n.createdAt
            })),
            expiringSoon: []
        })

    } catch (error) {
        console.error('Get inventory alerts error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Mark notification as read (Permanent Dismissal)
router.post('/notifications/:id/read', authenticateUser, async (req: any, res: any) => {
    try {
        const { id } = req.params
        const userId = req.user.userId

        // Check if bill exists and belongs to user
        const bill = await prisma.bill.findFirst({
            where: { id, userId }
        })

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' })
        }

        // Update isNotificationRead to true
        await prisma.bill.update({
            where: { id },
            data: { isNotificationRead: true }
        })

        res.status(200).json({ success: true, message: 'Notification marked as read' })
    } catch (error) {
        console.error('Mark notification read error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
