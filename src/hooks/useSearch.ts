import { useEffect, useState } from "react"
import { useQueryData } from "./useQueryData"
import { searchUsers } from "@/actions/user"

/**
 * useSearch Hook
 * Purpose: Manages search functionality with debouncing for different entity types
 * 
 * @param key - Unique key for caching search results
 * @param type - Type of search (currently only 'USERS' is supported)
 * 
 * Returns: Search handlers, query state, loading state, and search results
 */
export const useSearch = (key: string, type: 'USERS') => {
    // State Management
    const [query, setQuery] = useState('')      // Immediate search input
    const [debounce, setDebounce] = useState('') // Debounced search value
    
    // Type definition for user search results
    const [onUsers, setOnUsers] = useState<
    | {
        id: string
        subscription: {
          plan: 'PRO' | 'FREE'
        } | null
        firstname: string | null
        lastname: string | null
        image: string | null
        email: string | null
      }[]
    | undefined
    >(undefined)

    /**
     * Handles search input changes
     * Updates the query state with the current input value
     */
    const onSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    /**
     * Debounce Effect
     * Delays updating the debounced value by 1 second
     * Prevents excessive API calls while user is typing
     */
    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            setDebounce(query)
        }, 1000) // 1 second delay

        // Cleanup timeout on component unmount or query change
        return () => clearTimeout(delayInputTimeoutId)
    }, [query])

    /**
     * Search Query Handler
     * Uses useQueryData hook to manage API calls and caching
     * Currently supports user search only
     */
    const { refetch, isFetching } = useQueryData(
        [key, debounce], 
        async ({ queryKey }) => {
            if (type === 'USERS') {
                const users = await searchUsers(queryKey[1] as string)
                if (users.status === 200) {
                    setOnUsers(users.data)
                }
            }
        }, 
        false // Don't fetch automatically
    )

    /**
     * Debounce Effect Handler
     * Triggers search when debounced value changes
     * Clears results when search is empty
     */
    useEffect(() => {
        if (debounce) refetch()        // Perform search if we have a value
        if (!debounce) setOnUsers(undefined) // Clear results if empty
        
        return () => {
            debounce // Cleanup (currently not doing anything)
        }
    }, [debounce])

    // Return values for component use
    return {
        onSearchQuery,  // Function to handle input changes
        query,          // Current search input value
        isFetching,     // Loading state
        onUsers         // Search results
    }
}