import React, { createContext, useContext, useState } from 'react';
import { Customer } from '../types/customer';

interface CustomerContextType {
  // Shared customer list - loaded once, shared everywhere
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  customersLoaded: boolean;
  setCustomersLoaded: (loaded: boolean) => void;
  // Single customer detail
  customerDetails: Customer | null;
  setCustomerDetails: (details: Customer | null) => void;
  selectedCustomers: Customer[];
  setSelectedCustomers: (customers: Customer[]) => void;
  customerFilters: {
    search: string;
    status: 'all' | 'active' | 'inactive';
  };
  setCustomerFilters: (filters: any) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [customerFilters, setCustomerFilters] = useState({
    search: '',
    status: 'all' as const
  });

  return (
    <CustomerContext.Provider
      value={{
        customers,
        setCustomers,
        customersLoaded,
        setCustomersLoaded,
        customerDetails,
        setCustomerDetails,
        selectedCustomers,
        setSelectedCustomers,
        customerFilters,
        setCustomerFilters,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerContext = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomerContext must be used within a CustomerProvider');
  }
  return context;
};

export default CustomerContext;
