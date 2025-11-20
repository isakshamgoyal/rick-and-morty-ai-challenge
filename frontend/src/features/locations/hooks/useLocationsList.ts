import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/src/shared/lib/api';
import type { Location, LocationsPage } from '../types';

/**
 * Converts an error object into a user-friendly error message string.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Failed to load locations. Make sure the backend is running.';
}

/**
 * Custom hook for fetching and managing paginated locations list (without residents) with infinite scroll support.
 * Handles loading states, error handling, and pagination automatically.
 * 
 * @returns Object containing locations array, loading states, error states, and control functions
 */
export function useLocationsList() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  const loadingPagesRef = useRef<Set<number>>(new Set());
  const isMountedRef = useRef(true);

  const loadLocations = useCallback(async (page: number) => {
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
      const data = await apiClient.getLocations(page, false);
      
      if (!isMountedRef.current) return;
      
      const locationsData = data as LocationsPage;
      
      setLocations(prev => {
        if (page === 1) {
          return locationsData.results;
        }
        const existingIds = new Set(prev.map(loc => loc.id));
        const newLocations = locationsData.results.filter(loc => !existingIds.has(loc.id));
        return [...prev, ...newLocations];
      });
      
      setHasMore(locationsData.info.next !== null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading locations:', error);
      
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
    loadLocations(currentPage + 1);
  }, [loading, hasMore, currentPage, loadLocations, paginationError]);

  const retry = useCallback(() => {
    loadLocations(1);
  }, [loadLocations]);

  const retryPagination = useCallback(() => {
    if (currentPage >= 1 && !loading) {
      setPaginationError(null);
      setHasMore(true);
      loadLocations(currentPage + 1);
    }
  }, [currentPage, loadLocations, loading]);

  useEffect(() => {
    isMountedRef.current = true;
    loadLocations(1);

    return () => {
      isMountedRef.current = false;
      loadingPagesRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    locations,
    loading,
    error,
    paginationError,
    hasMore,
    loadMore,
    retry,
    retryPagination,
  };
}

