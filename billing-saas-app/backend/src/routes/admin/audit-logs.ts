
import express from 'express';
import prisma from '../../lib/prisma';
import { authenticateToken, requireAdminOrManager } from '../../middleware/auth';

const router = express.Router();

// Apply middleware
router.use(authenticateToken);
// router.use(requireAdminOrManager);

router.get('/', async (req: any, res) => {
    try {
        console.log('Fetching audit logs for user:', req.user?.id);
        const logs = await (prisma as any).auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        console.log('Found logs:', logs.length);

        const formattedLogs = logs.map((log: any) => {
            let description = '';
            // If user supplied specific description in newData JSON, use it.
            if (log.newData) {
                try {
                    const data = JSON.parse(log.newData);
                    if (data.description) {
                        description = data.description;
                    }
                } catch (e) {
                    // ignore json parse error
                }
            }
            // Fallback
            if (!description) {
                description = `${log.entity} ${log.action}`;
            }

            return {
                id: log.id,
                action: log.action,
                entity: log.entity,
                description,
                ipAddress: log.ipAddress,
                timestamp: log.timestamp
            };
        });

        res.json({ logs: formattedLogs });
    } catch (error: any) {
        console.error('Audit Logs Error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs', details: error.message });
    }
});

export default router;
