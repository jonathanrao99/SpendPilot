import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Bill {
  id: string;
  image: string | null;
  store: string;
  date: string;
  category: string;
  tax: number;
  amount: number;
  total: number;
}

const initialBills: Bill[] = [
  { id: '1', image: null, store: 'Walmart', date: '2024-06-01', category: 'Food Supplies', tax: 8.5, amount: 120.45, total: 120.45 },
  { id: '2', image: null, store: 'Best Buy', date: '2024-06-03', category: 'Electronics', tax: 25, amount: 340, total: 340 },
  { id: '3', image: null, store: 'Shell', date: '2024-06-05', category: 'Gas', tax: 4.2, amount: 60, total: 60 },
  { id: '4', image: null, store: 'Target', date: '2024-05-28', category: 'Groceries', tax: 6, amount: 80, total: 80 },
  { id: '5', image: null, store: 'Starbucks', date: '2024-05-27', category: 'Food', tax: 1.25, amount: 15.25, total: 15.25 },
  { id: '6', image: null, store: 'Home Depot', date: '2024-05-20', category: 'Hardware', tax: 16, amount: 200, total: 200 },
];

interface BillsContextType {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export function BillsProvider({ children }: { children: ReactNode }) {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  return <BillsContext.Provider value={{ bills, setBills }}>{children}</BillsContext.Provider>;
}

export function useBills(): BillsContextType {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBills must be used within a BillsProvider');
  }
  return context;
} 