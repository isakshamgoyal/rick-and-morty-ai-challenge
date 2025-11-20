import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/src/shared/lib/api';
import type { Character, CharactersPage } from '../types';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Failed to load characters. Make sure the backend is running.';
}

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  const loadingPagesRef = useRef<Set<number>>(new Set());
  const isMountedRef = useRef(true);

  const loadCharacters = useCallback(async (page: number) => {
    if (loadingPagesRef.current.has(page)) return;
    
    loadingPagesRef.current.add(page);
    setLoading(true);
    
    if (page === 1) {
      setError(null);
      setPaginationError(null);
    } else {
      setPaginationError(null);
    }
    
    try {
      const data = await apiClient.getCharacters(page);
      
      if (!isMountedRef.current) return;
      
      const charactersData = data as CharactersPage;
      
      setCharacters(prev => {
        if (page === 1) {
          return charactersData.results;
        }
        const existingIds = new Set(prev.map(char => char.id));
        const newCharacters = charactersData.results.filter(char => !existingIds.has(char.id));
        return [...prev, ...newCharacters];
      });
      
      setHasMore(data.info.next !== null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading characters:', error);
      
      if (!isMountedRef.current) return;
      
      const errorMessage = getErrorMessage(error);
      
      if (page === 1) {
        setError(errorMessage);
      } else {
        setPaginationError(errorMessage);
        setHasMore(false);
      }
    } finally {
      loadingPagesRef.current.delete(page);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || paginationError) return;
    loadCharacters(currentPage + 1);
  }, [loading, hasMore, currentPage, loadCharacters, paginationError]);

  const retry = useCallback(() => {
    loadCharacters(1);
  }, [loadCharacters]);

  const retryPagination = useCallback(() => {
    if (currentPage >= 1 && !loading) {
      setPaginationError(null);
      setHasMore(true);
      loadCharacters(currentPage + 1);
    }
  }, [currentPage, loadCharacters, loading]);

  useEffect(() => {
    isMountedRef.current = true;
    loadCharacters(1);
    
    return () => {
      isMountedRef.current = false;
      loadingPagesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    characters,
    loading,
    error,
    paginationError,
    hasMore,
    loadMore,
    retry,
    retryPagination,
  };
}

