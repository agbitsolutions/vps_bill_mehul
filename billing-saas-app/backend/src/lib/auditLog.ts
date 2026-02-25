
import prisma from './prisma';

interface AuditLogParams {
    userId?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    entity: string;
    entityId?: string;
    description: string;
    req?: any; // To extract IP and User Agent
    oldData?: any;
    newData?: any;
    prismaClient?: any; // Optional transaction client
}

export const recordAuditLog = async (params: AuditLogParams) => {
    try {
        const { userId, action, entity, entityId, description, req, oldData, newData, prismaClient } = params;

        // Determine client to use (transaction or global)
        const db = prismaClient || prisma;

        // Extract IP and User Agent
        let ipAddress = 'Unknown';
        let userAgent = 'Unknown';

        if (req) {
            // Handle various IP headers depending on proxy setup
            const xForwardedFor = req.headers['x-forwarded-for'];
            if (typeof xForwardedFor === 'string') {
                ipAddress = xForwardedFor.split(',')[0].trim();
            } else if (Array.isArray(xForwardedFor)) {
                ipAddress = xForwardedFor[0];
            } else {
                ipAddress = req.socket?.remoteAddress || req.ip || 'Unknown';
            }

            userAgent = req.headers['user-agent'] || 'Unknown';
        }

        // Storing description in newData JSON so we can retrieve it easily
        const metaData = {
            description,
            ...(newData || {})
        };

        console.log(`[AuditLog] Recording ${action} on ${entity}: ${description}`);

        await (db as any).auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                ipAddress,
                userAgent,
                oldData: oldData ? JSON.stringify(oldData) : null,
                newData: JSON.stringify(metaData),
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

// Deprecated alias for backward compatibility if needed, but we should switch all calls
export const createAuditLog = async (params: any) => {
    return recordAuditLog({
        ...params,
        req: { ip: params.ipAddress, headers: { 'user-agent': params.userAgent } }
    });
}
