// context/DeliveryContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type PlatformType = 'all'|'grubhub'|'ubereats'|'doordash';

export interface OrderRecord {
  id: string;
  date: Date;
  platform: PlatformType;
  itemsCount: number;
  grossSales: number;
  netPayout: number;
  fees: number;
  tip: number;
  deliveryTimeMinutes?: number;
}

type DeliveryContextType = {
  records: OrderRecord[];
  addRecords: (newRecords: OrderRecord[]) => void;
  clearRecords: () => void;
};

const DeliveryContext = createContext<DeliveryContextType|undefined>(undefined);

export const DeliveryProvider: React.FC<{children:ReactNode}> = ({ children }) => {
  const [records, setRecords] = useState<OrderRecord[]>([]);
  const addRecords = (newRecords: OrderRecord[]) =>
    setRecords(prev => [...prev, ...newRecords]);
  const clearRecords = () => setRecords([]);
  return (
    <DeliveryContext.Provider value={{ records, addRecords, clearRecords }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = (): DeliveryContextType => {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within DeliveryProvider');
  return ctx;
};