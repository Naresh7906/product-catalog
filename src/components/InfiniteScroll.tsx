import * as React from 'react';

interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  next: () => unknown;
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
  children?: React.ReactNode;
}

export default function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = '0px',
  children,
}: InfiniteScrollProps) {
  const observer = React.useRef<IntersectionObserver>();
  const lastElementRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (isLoading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          next();
        }
      },
      { threshold, root, rootMargin },
    );

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, isLoading, next, threshold, root, rootMargin]);

  return (
    <>
      {children}
      <div ref={lastElementRef} style={{ height: '1px', visibility: 'hidden' }} />
    </>
  );
} 