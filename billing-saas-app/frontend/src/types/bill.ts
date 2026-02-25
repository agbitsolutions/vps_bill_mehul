
export type BillStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';

export interface BillItem {
    id?: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Bill {
    id: string;
    billNumber?: string;
    customerId: string;
    customerName: string;
    customerEmail?: string | null;
    items: BillItem[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    status: BillStatus;
    supplierId?: string | null;

    // Payment & Credits
    paymentStatus?: 'PAID' | 'PARTIAL' | 'PENDING';
    paidAmount?: number;
    dueAmount?: number;

    dueDate: string; // Required to fix new Date(dueDate) errors
    createdAt: string; // Required
    updatedAt: string; // Required

    supplier?: {
        id: string;
        name: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
    } | null;
}
