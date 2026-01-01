import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface SharedTransaction {
  date: Date;
  description: string;
  amount: number;
}

export interface SharedFile {
  name: string;
  transactionCount: number;
}

interface TransactionContextType {
  sharedTransactions: SharedTransaction[];
  sharedFiles: SharedFile[];
  hasSharedData: boolean;
  setSharedData: (files: SharedFile[], transactions: SharedTransaction[]) => void;
  clearSharedData: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [sharedTransactions, setSharedTransactions] = useState<SharedTransaction[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);

  const setSharedData = useCallback((files: SharedFile[], transactions: SharedTransaction[]) => {
    setSharedFiles(files);
    setSharedTransactions(transactions);
  }, []);

  const clearSharedData = useCallback(() => {
    setSharedFiles([]);
    setSharedTransactions([]);
  }, []);

  const hasSharedData = sharedTransactions.length > 0;

  return (
    <TransactionContext.Provider value={{
      sharedTransactions,
      sharedFiles,
      hasSharedData,
      setSharedData,
      clearSharedData
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
}
