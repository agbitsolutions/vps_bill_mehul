
export interface Product {
    id: string;
    name: string;
    description?: string | null; // Allow null
    price: number;
    taxRate?: number;
    stock?: number;
    quantity?: number; // Seems used in logic
    category?: string | null;
    sku?: string | null;

    // Missing fields restored
    customFields?: Record<string, any> | null;
    tax?: number; // UI state field?

    // Inventory Intelligence
    minStockLevel?: number;
    expiryDate?: string | null;
    batchNumber?: string | null;
    supplierId?: string | null;

    userId?: string;
    createdAt: string; // Required
    updatedAt: string; // Required
}
