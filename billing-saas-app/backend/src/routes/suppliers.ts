
import express from 'express'
import prisma from '../lib/prisma'
import { extractUserFromRequest } from '../lib/auth'
import { createAuditLog, recordAuditLog } from '../lib/auditLog'

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

// Get all suppliers
router.get('/', authenticateUser, async (req: any, res) => {
    try {
        const { search } = req.query
        const userId = req.user.userId

        const whereClause: any = { userId }

        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { contact: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ]
        }

        const suppliers = await (prisma as any).supplier.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { products: true, bills: true }
                }
            }
        })

        res.status(200).json({ suppliers })

    } catch (error) {
        console.error('Get suppliers error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create supplier
router.post('/', authenticateUser, async (req: any, res) => {
    try {
        const { name, contact, phone, email, address, balance } = req.body
        const userId = req.user.userId

        if (!name) {
            return res.status(400).json({ error: 'Supplier name is required' })
        }

        const supplier = await (prisma as any).supplier.create({
            data: {
                userId,
                name,
                contact: contact || null,
                phone: phone || null,
                email: email || null,
                address: address || null,
                balance: parseFloat(balance || '0')
            }
        })

        // Audit Log: Create
        await recordAuditLog({
            userId,
            action: 'CREATE',
            entity: 'Supplier',
            entityId: supplier.id,
            description: `Supplier: ${supplier.name} created`,
            req, // Pass request for IP
            newData: { name: supplier.name, contact: supplier.contact }
        });

        res.status(201).json({
            message: 'Supplier created successfully',
            supplier
        })

    } catch (error: any) {
        console.error('Create supplier error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get supplier by ID
router.get('/:id', authenticateUser, async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId

        const supplier = await (prisma as any).supplier.findFirst({
            where: {
                id: id,
                userId: userId
            },
            include: {
                products: true,
                bills: true
            }
        })

        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' })
        }

        res.status(200).json({ supplier })

    } catch (error) {
        console.error('Get supplier error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update supplier
router.put('/:id', authenticateUser, async (req: any, res) => {
    handleUpdate(req, res)
})

router.patch('/:id', authenticateUser, async (req: any, res) => {
    handleUpdate(req, res)
})

async function handleUpdate(req: any, res: any) {
    try {
        const { id } = req.params
        const { name, contact, phone, email, address, balance } = req.body
        const userId = req.user.userId

        // Only enforce name if it's a PUT (full update) or if it's provided in PATCH
        if (req.method === 'PUT' && !name) {
            return res.status(400).json({ error: 'Supplier name is required for full update' })
        }

        const data: any = {}
        if (name !== undefined) data.name = name
        if (contact !== undefined) data.contact = contact
        if (phone !== undefined) data.phone = phone
        if (email !== undefined) data.email = email
        if (address !== undefined) data.address = address
        if (balance !== undefined) data.balance = parseFloat(balance)

        const supplier = await (prisma as any).supplier.updateMany({
            where: {
                id: id,
                userId: userId
            },
            data
        })

        if (supplier.count === 0) {
            return res.status(404).json({ error: 'Supplier not found' })
        }

        const updatedSupplier = await (prisma as any).supplier.findFirst({
            where: {
                id: id,
                userId: userId
            }
        })

        res.status(200).json({
            message: 'Supplier updated successfully',
            supplier: updatedSupplier
        })

    } catch (error) {
        console.error('Update supplier error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Delete supplier
router.delete('/:id', authenticateUser, async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.userId

        // Fetch supplier before deletion
        const supplier = await (prisma as any).supplier.findFirst({
            where: { id, userId }
        });

        const result = await (prisma as any).supplier.deleteMany({
            where: {
                id: id,
                userId: userId
            }
        })

        if (result.count === 0) {
            return res.status(404).json({ error: 'Supplier not found' })
        }

        // Audit Log: Delete
        if (supplier) {
            await recordAuditLog({
                userId,
                action: 'DELETE',
                entity: 'Supplier',
                entityId: id,
                description: `Supplier: ${supplier.name} deleted`,
                req, // Pass request for IP
                oldData: { name: supplier.name, contact: supplier.contact }
            });
        }

        res.status(200).json({ message: 'Supplier deleted successfully' })

    } catch (error: any) {
        console.error('Delete supplier error:', error)

        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete supplier with associated products or bills' })
        }

        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
