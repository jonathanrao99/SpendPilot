import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../app/utils/supabaseClient';

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

interface BillsContextType {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export function BillsProvider({ children }: { children: ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  useEffect(() => {
    (async () => {
      const merchantId = await AsyncStorage.getItem('merchant_id');
      if (!merchantId) return;
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', merchantId)
        .order('date', { ascending: false });
      if (error) console.error(error);
      else {
        const loaded = data.map(e => ({
          id: e.id,
          image: e.receipt_url,
          store: e.description,
          date: e.date.split('T')[0],
          category: e.category,
          tax: 0,
          amount: parseFloat(e.amount.toString()),
          total: parseFloat(e.amount.toString()),
        }));
        setBills(loaded);
      }
    })();
  }, []);

  return <BillsContext.Provider value={{ bills, setBills }}>{children}</BillsContext.Provider>;
}

export function useBills(): BillsContextType {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error('useBills must be used within a BillsProvider');
  }
  return context;
} 