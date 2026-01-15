"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface FavoriteList {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  item_count: number;
}

export interface FavoriteItem {
  favorite_item_id: string;
  product_id: string;
  variantId?: string;
  product_handle: string;
  added_at: string;
  title?: string;
  featuredImage?: { url: string; altText: string } | null;
  price?: { amount: string; currencyCode: string } | null;
  compareAtPrice?: { amount: string; currencyCode: string } | null;
  sku?: string;
}

// Custom event for favorites updates
export const FAVORITES_UPDATED_EVENT = "favorites-updated";

export function useFavorites() {
  const [lists, setLists] = useState<FavoriteList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, string[]>>(new Map()); // productId -> listIds

  // Get auth token
  const getAuthToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  // Fetch all lists
  const fetchLists = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setLists([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/favorites/lists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der Listen');
      }

      setLists(data.lists || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching favorite lists:', err);
      setError(err.message);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // Create a new list
  const createList = useCallback(async (name: string): Promise<FavoriteList | null> => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Nicht autorisiert');

      const response = await fetch('/api/favorites/lists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Liste');
      }

      // Update local state
      setLists(prev => [...prev, data.list]);
      window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
      
      return data.list;
    } catch (err: any) {
      console.error('Error creating list:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Rename a list
  const renameList = useCallback(async (listId: string, name: string): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Nicht autorisiert');

      const response = await fetch('/api/favorites/lists', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listId, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Umbenennen der Liste');
      }

      // Update local state
      setLists(prev => prev.map(list => 
        list.id === listId ? { ...list, name } : list
      ));
      window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
    } catch (err: any) {
      console.error('Error renaming list:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Delete a list
  const deleteList = useCallback(async (listId: string): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Nicht autorisiert');

      const response = await fetch(`/api/favorites/lists?listId=${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Löschen der Liste');
      }

      // Update local state
      setLists(prev => prev.filter(list => list.id !== listId));
      // Clear cache for deleted list
      cacheRef.current.forEach((listIds, productId) => {
        if (listIds.includes(listId)) {
          cacheRef.current.set(productId, listIds.filter(id => id !== listId));
        }
      });
      window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
    } catch (err: any) {
      console.error('Error deleting list:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Get list products
  const getListProducts = useCallback(async (listId: string): Promise<{ list: FavoriteList; products: FavoriteItem[] }> => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Nicht autorisiert');

      const response = await fetch(`/api/favorites/lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der Liste');
      }

      return {
        list: data.list,
        products: data.products,
      };
    } catch (err: any) {
      console.error('Error fetching list products:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Check if product is in any lists
  const checkProductInLists = useCallback(async (productId: string): Promise<string[]> => {
    // Check cache first
    if (cacheRef.current.has(productId)) {
      return cacheRef.current.get(productId) || [];
    }

    try {
      const token = await getAuthToken();
      if (!token) return [];

      const response = await fetch(`/api/favorites?productId=${encodeURIComponent(productId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Prüfen des Favoriten-Status');
      }

      const listIds = data.listIds || [];
      cacheRef.current.set(productId, listIds);
      return listIds;
    } catch (err: any) {
      console.error('Error checking product in lists:', err);
      return [];
    }
  }, [getAuthToken]);

  // Add product to a list
  const addToList = useCallback(async (listId: string, productId: string, productHandle: string): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Nicht autorisiert');

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listId, productId, productHandle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Hinzufügen des Favoriten');
      }

      // Update cache
      const currentLists = cacheRef.current.get(productId) || [];
      if (!currentLists.includes(listId)) {
        cacheRef.current.set(productId, [...currentLists, listId]);
      }

      // Update list item count
      setLists(prev => prev.map(list => 
        list.id === listId ? { ...list, item_count: list.item_count + 1 } : list
      ));

      window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
    } catch (err: any) {
      console.error('Error adding to list:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Remove product from a list
  const removeFromList = useCallback(async (listId: string, productId: string): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Nicht autorisiert');

      const response = await fetch(
        `/api/favorites?listId=${listId}&productId=${encodeURIComponent(productId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Entfernen des Favoriten');
      }

      // Update cache
      const currentLists = cacheRef.current.get(productId) || [];
      cacheRef.current.set(productId, currentLists.filter(id => id !== listId));

      // Update list item count
      setLists(prev => prev.map(list => 
        list.id === listId ? { ...list, item_count: Math.max(0, list.item_count - 1) } : list
      ));

      window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
    } catch (err: any) {
      console.error('Error removing from list:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Remove by item ID
  const removeByItemId = useCallback(async (itemId: string, listId: string, productId: string): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Nicht autorisiert');

      const response = await fetch(`/api/favorites?itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Entfernen des Favoriten');
      }

      // Update cache
      const currentLists = cacheRef.current.get(productId) || [];
      cacheRef.current.set(productId, currentLists.filter(id => id !== listId));

      // Update list item count
      setLists(prev => prev.map(list => 
        list.id === listId ? { ...list, item_count: Math.max(0, list.item_count - 1) } : list
      ));

      window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
    } catch (err: any) {
      console.error('Error removing from list:', err);
      throw err;
    }
  }, [getAuthToken]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Load lists on mount and when user changes
  useEffect(() => {
    fetchLists();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchLists();
      } else if (event === 'SIGNED_OUT') {
        setLists([]);
        clearCache();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchLists, clearCache]);

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    renameList,
    deleteList,
    getListProducts,
    checkProductInLists,
    addToList,
    removeFromList,
    removeByItemId,
    clearCache,
  };
}
