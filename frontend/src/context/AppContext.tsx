import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { APIError } from '../services/api';

interface ErrorState {
  message: string;
  code?: string;
  retryFn?: () => Promise<void>;
}

interface AppContextState {
  isLoading: boolean;
  error: ErrorState | null;
  setLoading: (loading: boolean) => void;
  setError: (error: ErrorState | null) => void;
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryLastOperation = useCallback(async () => {
    if (error?.retryFn) {
      clearError();
      await error.retryFn();
    }
  }, [error, clearError]);

  const value = {
    isLoading,
    error,
    setLoading: setIsLoading,
    setError,
    clearError,
    retryLastOperation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Utility hook for handling async operations with loading and error states
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    retryable?: boolean;
  } = {}
) {
  const { setLoading, setError } = useApp();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error | APIError;
      const errorState: ErrorState = {
        message: error instanceof APIError 
          ? `API Error: ${error.message}`
          : error.message,
        code: error instanceof APIError ? String(error.status) : undefined,
      };

      if (options.retryable) {
        errorState.retryFn = async () => {
          await execute();
        };
      }

      setError(errorState);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [operation, options, setError, setLoading]);

  return execute;
} 