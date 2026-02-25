/**
 * Analytics Query Helpers
 * 
 * Provides convenient functions to query database views and analytics data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type definitions for view results
export interface BillSummary {
  userId: string;
  totalBills: number;
  totalPaid: number;
  totalOverdue: number;
  totalPending: number;
  totalDraft: number;
  totalRevenue: number;
  totalOverdueAmount: number;
  avgBillValue: number | null;
  firstBillDate: string;
  lastBillDate: string;
}

export interface DailyRevenue {
  date: string;
  paidRevenue: number;
  paidCount: number;
  overdueCount: number;
  pendingCount: number;
  totalBillsCreated: number;
  avgPaidAmount: number | null;
}

export interface CustomerValue {
  customerId: string;
  userId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  totalBills: number;
  totalPaidAmount: number;
  totalOverdueAmount: number;
  totalBilledAmount: number;
  avgBillValue: number | null;
  firstBillDate: string | null;
  lastBillDate: string | null;
  paidBillsCount: number;
  overdueBillsCount: number;
  customerSince: string;
}

export interface OverdueDetail {
  billId: string;
  userId: string;
  customerId: string;
  billNumber: string;
  customerName: string;
  customerEmail: string | null;
  totalAmount: number;
  dueDate: string | null;
  daysOverdue: number;
  createdAt: string;
  updatedAt: string;
  customerPhone: string | null;
  customerAddress: string | null;
}

export interface SecurityEvent {
  id: string;
  userId: string | null;
  eventType: string;
  description: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

/**
 * Get bill summary for a specific user or all users
 */
export async function getBillSummary(userId?: string): Promise<BillSummary[]> {
  const whereClause = userId ? 'WHERE userId = ?' : '';
  const params = userId ? [userId] : [];
  
  const result = await prisma.$queryRawUnsafe<BillSummary[]>(`
    SELECT * FROM vw_bill_summary ${whereClause}
    ORDER BY totalRevenue DESC
  `, ...params);
  
  return result;
}

/**
 * Get daily revenue data for a date range
 */
export async function getDailyRevenue(
  startDate?: string,
  endDate?: string,
  limit: number = 30
): Promise<DailyRevenue[]> {
  let whereClause = '';
  const params: any[] = [];
  
  if (startDate && endDate) {
    whereClause = 'WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (startDate) {
    whereClause = 'WHERE date >= ?';
    params.push(startDate);
  } else if (endDate) {
    whereClause = 'WHERE date <= ?';
    params.push(endDate);
  }
  
  const result = await prisma.$queryRawUnsafe<DailyRevenue[]>(`
    SELECT * FROM vw_daily_revenue 
    ${whereClause}
    ORDER BY date DESC 
    LIMIT ?
  `, ...params, limit);
  
  return result;
}

/**
 * Get customer value analysis
 */
export async function getCustomerValue(
  userId?: string,
  limit: number = 50
): Promise<CustomerValue[]> {
  const whereClause = userId ? 'WHERE userId = ?' : '';
  const params = userId ? [userId, limit] : [limit];
  
  const result = await prisma.$queryRawUnsafe<CustomerValue[]>(`
    SELECT * FROM vw_customer_value 
    ${whereClause}
    ORDER BY totalPaidAmount DESC 
    LIMIT ?
  `, ...params);
  
  return result;
}

/**
 * Get overdue bills with details
 */
export async function getOverdueBills(
  userId?: string,
  limit: number = 100
): Promise<OverdueDetail[]> {
  const whereClause = userId ? 'AND userId = ?' : '';
  const params = userId ? [userId, limit] : [limit];
  
  const result = await prisma.$queryRawUnsafe<OverdueDetail[]>(`
    SELECT * FROM vw_overdue_detail 
    WHERE 1=1 ${whereClause}
    ORDER BY daysOverdue DESC, totalAmount DESC 
    LIMIT ?
  `, ...params);
  
  return result;
}

/**
 * Get recent security events
 */
export async function getRecentSecurityEvents(
  userId?: string,
  limit: number = 100
): Promise<SecurityEvent[]> {
  const whereClause = userId ? 'WHERE userId = ?' : '';
  const params = userId ? [userId, limit] : [limit];
  
  const result = await prisma.$queryRawUnsafe<SecurityEvent[]>(`
    SELECT * FROM vw_security_recent 
    ${whereClause}
    ORDER BY createdAt DESC 
    LIMIT ?
  `, ...params);
  
  return result;
}

/**
 * Get revenue trend for charts (last N days)
 */
export async function getRevenueTrend(days: number = 30): Promise<{
  date: string;
  revenue: number;
  billsCount: number;
}[]> {
  const result = await prisma.$queryRawUnsafe<{
    date: string;
    revenue: number;
    billsCount: number;
  }[]>(`
    SELECT 
      DATE(created_at) as date,
      SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END) as revenue,
      COUNT(CASE WHEN status = 'PAID' THEN 1 ELSE NULL END) as billsCount
    FROM bills 
    WHERE created_at >= DATE('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);
  
  return result;
}

/**
 * Get top customers by revenue
 */
export async function getTopCustomers(
  userId?: string,
  limit: number = 10
): Promise<{
  customerName: string;
  customerEmail: string | null;
  totalRevenue: number;
  billsCount: number;
}[]> {
  const whereClause = userId ? 'WHERE c.user_id = ?' : '';
  const params = userId ? [userId, limit] : [limit];
  
  const result = await prisma.$queryRawUnsafe<{
    customerName: string;
    customerEmail: string | null;
    totalRevenue: number;
    billsCount: number;
  }[]>(`
    SELECT 
      c.name as customerName,
      c.email as customerEmail,
      SUM(CASE WHEN b.status = 'PAID' THEN b.total_amount ELSE 0 END) as totalRevenue,
      COUNT(b.id) as billsCount
    FROM customers c
    LEFT JOIN bills b ON c.id = b.customer_id
    ${whereClause}
    GROUP BY c.id, c.name, c.email
    HAVING totalRevenue > 0
    ORDER BY totalRevenue DESC
    LIMIT ?
  `, ...params);
  
  return result;
}

/**
 * Get monthly revenue summary
 */
export async function getMonthlyRevenue(
  months: number = 12
): Promise<{
  month: string;
  revenue: number;
  billsPaid: number;
  totalBills: number;
  avgBillValue: number | null;
}[]> {
  const result = await prisma.$queryRawUnsafe<{
    month: string;
    revenue: number;
    billsPaid: number;
    totalBills: number;
    avgBillValue: number | null;
  }[]>(`
    SELECT * FROM vw_monthly_revenue 
    ORDER BY month DESC 
    LIMIT ?
  `, months);
  
  return result;
}

/**
 * Get dashboard metrics for a user
 */
export async function getDashboardMetrics(userId: string) {
  const [
    billSummary,
    recentRevenue,
    topCustomers,
    overdueCount
  ] = await Promise.all([
    getBillSummary(userId),
    getDailyRevenue(undefined, undefined, 7),
    getTopCustomers(userId, 5),
    getOverdueBills(userId, 1)
  ]);
  
  return {
    summary: billSummary[0] || null,
    recentRevenue,
    topCustomers,
    overdueCount: overdueCount.length
  };
}

// Export the prisma instance for cleanup
export { prisma };
