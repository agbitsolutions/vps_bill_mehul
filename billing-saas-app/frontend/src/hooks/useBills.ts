import { useEffect, useState, useCallback } from 'react';
import { Bill } from '../types/bill';
import { useBillContext } from '../contexts/BillContext';
import { IBillService } from '../services/billService';
import { getBillService } from '../services/DIContainer';

/**
 * useBills hook integrates dependency injection with React context
 * Follows SOLID principles by using injected services and focused context
 */
const useBills = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Added for submission state
    const {
        billHistory,
        setBillHistory,
        currentBill,
        setCurrentBill,
        selectedBills,
        setSelectedBills,
        billPreviewMode,
        setBillPreviewMode
    } = useBillContext();

    // Get the bill service through dependency injection
    const billService: IBillService = getBillService();

    const loadBills = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const billList = await billService.getBills();
            setBillHistory(billList);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load bills');
        } finally {
            setLoading(false);
        }
    }, [billService, setBillHistory]);

    useEffect(() => {
        loadBills();
    }, [loadBills]);

    useEffect(() => {
        // Custom Pattern: Global Refresh Listener
        const handleRefresh = () => {
            console.log('Refreshing bills due to global event');
            loadBills();
        };

        window.addEventListener('bill-created', handleRefresh);
        window.addEventListener('bills-updated', handleRefresh);

        return () => {
            window.removeEventListener('bill-created', handleRefresh);
            window.removeEventListener('bills-updated', handleRefresh);
        };
    }, []); // Listen once for global events

    const createBill = useCallback(async (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setError(null);
            setIsSubmitting(true); // Set submitting state
            const newBill = await billService.createBill(billData);
            setBillHistory([...billHistory, newBill]);

            // Notify other components immediately
            window.dispatchEvent(new Event('inventory-updated'));
            window.dispatchEvent(new Event('bills-updated'));
            window.dispatchEvent(new Event('bill-created'));

            return newBill;
        } catch (err: any) {
            // Extract specific error message from server response if available
            const errorMessage = err.response?.data?.error || err.data?.error || err.message || 'Failed to create bill';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    }, [billService, setBillHistory, billHistory]);

    const updateBill = useCallback(async (updatedBill: Bill) => {
        try {
            setError(null);
            setIsSubmitting(true); // Set submitting state
            const result = await billService.updateBill(updatedBill);
            setBillHistory(billHistory.map(b => b.id === updatedBill.id ? result : b));

            // Update context if this is the currently selected bill
            if (currentBill?.id === updatedBill.id) {
                setCurrentBill(result);
            }

            return result;
        } catch (err: any) {
            // Extract specific error message from server response if available
            const errorMessage = err.response?.data?.error || err.data?.error || err.message || 'Failed to update bill';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    }, [billService, setBillHistory, billHistory, currentBill, setCurrentBill]);

    const deleteBill = useCallback(async (id: string) => {
        try {
            setError(null);
            await billService.deleteBill(id);
            setBillHistory(billHistory.filter(b => b.id !== id));

            // Clear context if this bill was selected
            if (currentBill?.id === id) {
                setCurrentBill(null);
            }

            // Remove from selected bills
            setSelectedBills(selectedBills.filter(b => b.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete bill';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [billService, setBillHistory, billHistory, currentBill, setCurrentBill, selectedBills, setSelectedBills]);

    const searchBills = useCallback(async (query: string) => {
        try {
            setError(null);
            const results = await billService.searchBills(query);
            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search bills';
            setError(errorMessage);
            return [];
        }
    }, [billService]);

    const exportBills = useCallback(async (format: 'csv' | 'json') => {
        try {
            setError(null);
            const blob = await billService.exportBills(format);
            return blob;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to export bills';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [billService]);

    return {
        bills: billHistory,
        loading,
        error,
        createBill,
        updateBill,
        deleteBill,
        searchBills,
        exportBills,
        isSubmitting, // Exposed
        refetch: loadBills,
        // Context state and setters
        currentBill,
        setCurrentBill,
        selectedBills,
        setSelectedBills,
        billPreviewMode,
        setBillPreviewMode,
    };
};

export { useBills };
export default useBills;
