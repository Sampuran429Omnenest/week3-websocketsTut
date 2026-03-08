import React from "react";
import { useThrottle } from "../shared/hooks/useThrottle";

interface InfiniteScrollListProps {
  onLoadMore: () => void;
  children: React.ReactNode;
}

export function InfiniteScrollList({ onLoadMore, children }: InfiniteScrollListProps) {
  
  // TypeScript now correctly infers that 'scrollTop' etc. are numbers
  const throttledCheck = useThrottle((scrollTop: number, clientHeight: number, scrollHeight: number) => {
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      onLoadMore();
    }
  }, 150);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // This call is now type-safe!
    throttledCheck(scrollTop, clientHeight, scrollHeight);
  };

  return (
    <div onScroll={handleScroll} style={{ overflowY: "auto", height: "100%" }}>
      {children}
    </div>
  );
}