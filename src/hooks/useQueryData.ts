import {
  Enabled,
  QueryFunction,
  QueryKey,
  useQuery,
} from "@tanstack/react-query";

/**
 * useQueryData Hook
 * Purpose: A wrapper around TanStack Query's useQuery hook to standardize query handling
 * 
 * @param queryKey - Unique identifier for the query (used for caching)
 * @param queryFn - Function that performs the actual data fetching
 * @param enabled - Optional flag to control when the query should run
 * 
 * Returns: Commonly used query states and the refetch function
 */
export const useQueryData = (
  queryKey: QueryKey,      // Array of values that uniquely identify the query
  queryFn: QueryFunction,  // Async function that fetches data
  enabled?: Enabled        // Optional boolean to enable/disable the query
) => {
  // Use TanStack Query's useQuery hook with provided parameters
  const { 
    data,       // The query result data
    isPending,  // True if the query is in a pending state (loading first time)
    isFetched,  // True if the query has been fetched at least once
    isFetching, // True if the query is currently fetching (including background updates)
    refetch     // Function to manually trigger a refetch
  } = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  // Return commonly used query states
  return { 
    data,       // The fetched data
    isPending,  // Loading state for first fetch
    isFetched,  // Whether data has been fetched
    isFetching, // Current loading state
    refetch     // Manual refetch trigger
  };
};
