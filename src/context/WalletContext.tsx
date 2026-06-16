'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { isConnected, getAddress } from '@stellar/freighter-api';

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  reputation: number;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reputation, setReputation] = useState(0);

  useEffect(() => {
    async function checkConnection() {
      try {
        const connected = await isConnected();
        if (connected) {
          const { address } = await getAddress();
          setPublicKey(address);
          // TODO: Fetch real reputation from Stellar
          setReputation(1250);
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false);
      }
    }
    checkConnection();
  }, []);

  async function connect() {
    try {
      const { address } = await getAddress();
      setPublicKey(address);
      setReputation(1250);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Please install Freighter wallet extension');
    }
  }

  function disconnect() {
    setPublicKey(null);
    setReputation(0);
  }

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected: !!publicKey,
        connect,
        disconnect,
        reputation,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
