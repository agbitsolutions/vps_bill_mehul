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

// Get all expenses
router.get('/', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user.userId
        const expenses = await (prisma as any).expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        })

        // Calculate category breakdown
        const breakdown = expenses.reduce((acc: any, exp: any) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount
            return acc
        }, {})

        res.status(200).json({ expenses, categoryBreakdown: breakdown })
    } catch (error) {
        console.error('Get expenses error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create expense
router.post('/', authenticateUser, async (req: any, res) => {
    try {
        const userId = req.user.userId
        const { title, category, amount, gstAmount, description, date } = req.body

        if (!title || !category || !amount) {
            return res.status(400).json({ error: 'Title, category, and amount are required' })
        }

        const expense = await (prisma as any).expense.create({
            data: {
                userId,
                title,
                category,
                amount: Number(amount),
                gstAmount: Number(gstAmount) || 0,
                description,
                date: date ? new Date(date) : new Date()
            }
        })

        res.status(201).json(expense)
    } catch (error: any) {
        console.error('Create expense error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

export default router
