
export interface Customer {
    id: string;
    name: string;
    email: string; // Changed to required to fix "possibly undefined" in search, assuming filtered upstream or required in DB
    phone: string; // Changed to required
    address?: string | null;
    gstNumber?: string | null;

    // Missing fields restored
    company?: string | null;
    totalPurchases?: number;

    // CRM
    dob?: string | null; // Allow null
    anniversaryDate?: string | null; // Allow null
    loyaltyPoints?: number;

    userId?: string;
    createdAt: string; // Required
    updatedAt: string; // Required
}
