import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/src/shared/lib/api';
import type { Location, LocationsPage } from '../types';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingPagesRef = useRef<Set<number>>(new Set());

  const loadLocations = useCallback(async (page: number) => {
    if (loadingPagesRef.current.has(page)) return;
    
    loadingPagesRef.current.add(page);
    setLoading(true);
    setError(null);
    
    try {
      const data: LocationsPage = await apiClient.getLocations(page);
      
      setLocations(prev => {
        if (page === 1) {
          return data.results;
        }
        return [...prev, ...data.results];
      });
      
      setHasMore(data.info.next !== null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Failed to load locations. Make sure the backend is running.');
    } finally {
      setLoading(false);
      loadingPagesRef.current.delete(page);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = currentPage + 1;
    loadLocations(nextPage);
  }, [loading, hasMore, currentPage, loadLocations]);

  useEffect(() => {
    loadLocations(1);
  }, [loadLocations]);

  return {
    locations,
    loading,
    error,
    hasMore,
    loadMore,
  };
}

