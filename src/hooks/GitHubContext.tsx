'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GitHubData {
  contributions: any[];
  total: number;
  languages: { [key: string]: number };
  projectStars: { [key: string]: number };
}

interface GitHubContextType {
  data: GitHubData | null;
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
}

const GitHubContext = createContext<GitHubContextType | null>(null);

let isRequestInProgress = false;
let lastRequestTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GitHubContextType>({
    data: null,
    loading: true,
    error: null,
    isInitialLoad: true
  });

  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();
      
      // Return cached data if it's fresh enough
      if (state.data && (now - lastRequestTime) < CACHE_DURATION) {
        setState(prev => ({ ...prev, loading: false, isInitialLoad: false }));
        return;
      }

      // Prevent concurrent requests
      if (isRequestInProgress) return;
      
      isRequestInProgress = true;

      try {
        const response = await fetch('/api/github');
        const data = await response.json();
        
        lastRequestTime = now;
        setState({
          data,
          loading: false,
          error: null,
          isInitialLoad: false
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch GitHub data',
          loading: false,
          isInitialLoad: false
        }));
      } finally {
        isRequestInProgress = false;
      }
    };

    fetchData();
  }, []);

  return (
    <GitHubContext.Provider value={state}>
      {children}
    </GitHubContext.Provider>
  );
}

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
} 