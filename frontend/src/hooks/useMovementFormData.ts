// src/hooks/useMovementFormData.ts
import { useState, useEffect } from 'react';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { Warehouse, Location, Item } from '@/types';

interface MovementFormData {
  warehouses: Array<{ id: string; name: string; code: string }>;
  locations: Array<{ id: string; name: string; code: string }>;
  items: Array<{ id: string; name: string; sku: string }>;
  users: Array<{ id: string; username: string }>; // You'll need to add user service
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch all necessary data for Movement Form/Detail modals
 * This hook fetches warehouses, locations, items, and users
 */
export const useMovementFormData = (): MovementFormData => {
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [items, setItems] = useState<Array<{ id: string; name: string; sku: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; username: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [warehousesResponse, locationsResponse, itemsResponse] = await Promise.all([
        locationService.getWarehouses({ size: 1000 }), // Get all warehouses
        locationService.getLocations({ size: 1000 }),  // Get all locations
        productService.getItems({ size: 1000 })        // Get all items
      ]);

      // Map warehouses to simplified format
      setWarehouses(
        warehousesResponse.content.map((w: Warehouse) => ({
          id: w.id,
          name: w.name,
          code: w.code
        }))
      );

      // Map locations to simplified format
      setLocations(
        locationsResponse.content.map((l: Location) => ({
          id: l.id,
          name: l.name,
          code: l.code
        }))
      );

      // Map items to simplified format
      setItems(
        itemsResponse.content.map((i: Item) => ({
          id: i.id,
          name: i.name,
          sku: i.sku
        }))
      );

      // TODO: Fetch users when user service is available
      // const usersResponse = await userService.getUsers({ size: 1000 });
      // setUsers(usersResponse.content.map(u => ({ id: u.id, username: u.username })));

      // Mock users for now (remove when user service is ready)
      setUsers([
        { id: 'user-1', username: 'Admin User' },
        { id: 'user-2', username: 'Warehouse Manager' },
        { id: 'user-3', username: 'Inventory Clerk' }
      ]);

    } catch (err: any) {
      console.error('Error fetching movement form data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    warehouses,
    locations,
    items,
    users,
    loading,
    error,
    refetch: fetchData
  };
};
