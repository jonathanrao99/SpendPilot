import React, { createContext, useContext, useState } from 'react';

export type Bill = { id: string; imageUri: string; storeName: string; date: string; category: string; taxPaid: string; total: string };

type BillsContextType = { bills: Bill[]; addBill: (bill: Bill) => void };

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const addBill = (bill: Bill) => setBills(prev => [...prev, bill]);
  return (
    <BillsContext.Provider value={{ bills, addBill }}>
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