import React, { createContext, useContext, useState } from 'react';

export type Bill = { id: string; imageUri: string; storeName: string; date: string; category: string; taxPaid: string; total: string };

type BillsContextType = { bills: Bill[]; addBill: (bill: Bill) => void; updateBill: (bill: Bill) => void; deleteBill: (id: string) => void };

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const addBill = (bill: Bill) => setBills(prev => [...prev, bill]);
  const updateBill = (updated: Bill) => setBills(prev => prev.map(b => b.id === updated.id ? updated : b));
  const deleteBill = (id: string) => setBills(prev => prev.filter(b => b.id !== id));
  return (
    <BillsContext.Provider value={{ bills, addBill, updateBill, deleteBill }}>
      {children}
    </BillsContext.Provider>
  );
};

export const useBills = (): BillsContextType => {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBills must be used within BillsProvider');
  }
  return context;
}; 