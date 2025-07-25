'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Types
export interface QueryResult {
  success: boolean;
  data: any;
  metadata?: {
    queryId: string;
    executionTime: string;
    resultCount: number;
    parameters?: any;
  };
  error?: string;
}

export interface QueryDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  learningObjectives: string[];
  businessScenario: string;
  mongodbConcepts: string[];
  queries: {
    name: string;
    description: string;
    code: string;
    explanation: string;
  }[];
}

export interface DatabaseStats {
  users: {
    total: number;
    jobSeekers: number;
    employers: number;
  };
  companies: {
    total: number;
    active: number;
  };
  jobs: {
    total: number;
    active: number;
  };
  applications: {
    total: number;
  };
  lastUpdated: string;
}

interface QueryState {
  queries: QueryDefinition[];
  currentQuery: QueryDefinition | null;
  queryResult: QueryResult | null;
  loading: boolean;
  error: string | null;
  dbStats: DatabaseStats | null;
  executionHistory: QueryResult[];
}

type QueryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_QUERIES'; payload: QueryDefinition[] }
  | { type: 'SET_CURRENT_QUERY'; payload: QueryDefinition | null }
  | { type: 'SET_QUERY_RESULT'; payload: QueryResult }
  | { type: 'SET_DB_STATS'; payload: DatabaseStats }
  | { type: 'ADD_TO_HISTORY'; payload: QueryResult }
  | { type: 'CLEAR_HISTORY' };

const initialState: QueryState = {
  queries: [],
  currentQuery: null,
  queryResult: null,
  loading: false,
  error: null,
  dbStats: null,
  executionHistory: [],
};

function queryReducer(state: QueryState, action: QueryAction): QueryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_QUERIES':
      return { ...state, queries: action.payload, loading: false, error: null };
    case 'SET_CURRENT_QUERY':
      return { ...state, currentQuery: action.payload };
    case 'SET_QUERY_RESULT':
      return { ...state, queryResult: action.payload, loading: false };
    case 'SET_DB_STATS':
      return { ...state, dbStats: action.payload };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        executionHistory: [action.payload, ...state.executionHistory.slice(0, 9)], // Keep last 10
      };
    case 'CLEAR_HISTORY':
      return { ...state, executionHistory: [] };
    default:
      return state;
  }
}

interface QueryContextType {
  state: QueryState;
  fetchQueries: () => Promise<void>;
  fetchQueryById: (id: string) => Promise<void>;
  executeQuery: (queryId: string, parameters?: any) => Promise<void>;
  executeCustomQuery: (query: any, collection: string, operation?: string) => Promise<void>;
  fetchDatabaseStats: () => Promise<void>;
  clearError: () => void;
  clearHistory: () => void;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queryReducer, initialState);

  const fetchQueries = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/queries`);
      const data = await response.json();

      if (data.success) {
        dispatch({ type: 'SET_QUERIES', payload: data.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to fetch queries' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error: Failed to fetch queries' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchQueryById = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/queries/${id}`);
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_CURRENT_QUERY', payload: data.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to fetch query details' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error: Failed to fetch query details' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const executeQuery = async (queryId: string, parameters: any = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/data/execute/${queryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parameters }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: 'SET_QUERY_RESULT', payload: result });
        dispatch({ type: 'ADD_TO_HISTORY', payload: result });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Query execution failed' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error: Failed to execute query' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const executeCustomQuery = async (query: any, collection: string, operation: string = 'find') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/data/execute-custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, collection, operation }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        dispatch({ type: 'SET_QUERY_RESULT', payload: result });
        dispatch({ type: 'ADD_TO_HISTORY', payload: result });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Custom query execution failed' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error: Failed to execute custom query' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchDatabaseStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data/stats`);
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_DB_STATS', payload: data.data });
      }
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  const contextValue: QueryContextType = {
    state,
    fetchQueries,
    fetchQueryById,
    executeQuery,
    executeCustomQuery,
    fetchDatabaseStats,
    clearError,
    clearHistory,
  };

  return (
    <QueryContext.Provider value={contextValue}>
      {children}
    </QueryContext.Provider>
  );
}

export function useQuery() {
  const context = useContext(QueryContext);
  if (context === undefined) {
    throw new Error('useQuery must be used within a QueryProvider');
  }
  return context;
}
