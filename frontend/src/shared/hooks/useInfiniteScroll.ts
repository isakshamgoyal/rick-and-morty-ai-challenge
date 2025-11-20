import { useEffect, useRef, useCallback } from 'react';

const DEBOUNCE_DELAY_MS = 500;
const OBSERVER_THRESHOLD = 0.1;

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  error?: string | null;
}

/**
 * Custom hook for infinite scroll functionality using IntersectionObserver.
 * 
 * @param options - Configuration object
 * @param options.hasMore - Whether there are more items to load
 * @param options.loading - Whether a load operation is currently in progress
 * @param options.onLoadMore - Callback function to load more items
 * @param options.error - Optional error state to prevent loading
 * @returns A ref to attach to the element that should trigger loading when visible
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { hasMore, loading, onLoadMore, error } = options;
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);
  const isTriggeringRef = useRef<boolean>(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;

      const shouldTrigger = hasMore && !loading && !error && !isTriggeringRef.current;
      if (!shouldTrigger) return;

      const now = Date.now();
      const timeSinceLastTrigger = now - lastTriggerTimeRef.current;
      if (timeSinceLastTrigger < DEBOUNCE_DELAY_MS) return;

      isTriggeringRef.current = true;
      lastTriggerTimeRef.current = now;
      onLoadMore();

      setTimeout(() => {
        isTriggeringRef.current = false;
      }, 100);
    },
    [hasMore, loading, error, onLoadMore]
  );

  useEffect(() => {
    const target = observerTarget.current;

    if (!target || !hasMore || loading || error) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: OBSERVER_THRESHOLD,
    });

    observerRef.current = observer;
    observer.observe(target);

    return () => {
      observer.disconnect();
      observerRef.current = null;
      isTriggeringRef.current = false;
    };
  }, [hasMore, loading, error, handleIntersection]);

  return observerTarget;
}

