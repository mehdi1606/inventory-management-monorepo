// frontend/src/pages/inventory/InventoryPage.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Package, TrendingUp, AlertTriangle, Archive } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

interface Inventory {
  id: string;
  itemId: string;
  warehouseId: string;
  locationId: string;
  lotId?: string;
  serialId?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityDamaged: number;
  availableQuantity: number;
  uom: string;
  status: string;
  unitCost?: number;
  expiryDate?: string;
  manufactureDate?: string;
  lastCountDate?: string;
  attributes?: string;
  createdAt: string;
  updatedAt: string;
}

export const InventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getAllInventories();
      setInventories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to fetch inventories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInventory(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setIsEditModalOpen(true);
  };

  const handleDelete = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInventory) return;

    try {
      await inventoryService.deleteInventory(selectedInventory.id);
      toast.success('Inventory deleted successfully');
      fetchInventories();
    } catch (error: any) {
      toast.error('Failed to delete inventory');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedInventory(null);
    }
  };

  const handleFormSuccess = () => {
    fetchInventories();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedInventory(null);
  };

  const filteredInventories = inventories.filter((inv) => {
    const matchesSearch =
      searchTerm === '' ||
      inv.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.locationId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === '' || inv.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: inventories.length,
    available: inventories.filter((i) => i.status === 'AVAILABLE').length,
    reserved: inventories.filter((i) => i.status === 'RESERVED').length,
    damaged: inventories.filter((i) => i.status === 'DAMAGED').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage inventory levels</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          New Inventory
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by item or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full">
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="QUARANTINED">Quarantined</option>
            <option value="DAMAGED">Damaged</option>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inventory</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
            </div>
            <Archive className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Damaged</p>
              <p className="text-2xl font-bold text-red-600">{stats.damaged}</p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No inventories found
                    </td>
                  </tr>
                ) : (
                  filteredInventories.map((inventory) => (
                    <tr key={inventory.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inventory.itemId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.locationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inventory.quantityOnHand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.quantityReserved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {inventory.availableQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.uom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            inventory.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800'
                              : inventory.status === 'RESERVED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : inventory.status === 'DAMAGED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {inventory.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(inventory)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(inventory)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <InventoryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedInventory(null);
        }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      {/* Edit Modal */}
      <InventoryFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInventory(null);
        }}
        onSuccess={handleFormSuccess}
        mode="edit"
        inventory={selectedInventory}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedInventory(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Inventory"
        message="Are you sure you want to delete this inventory record? This action cannot be undone."
      />
    </div>
  );
};

// ============================================================================
// INVENTORY FORM MODAL COMPONENT
// ============================================================================

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  inventory?: Inventory | null;
}

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  inventory,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [serials, setSerials] = useState<any[]>([]);

  // Form data matching backend DTO
  const [formData, setFormData] = useState({
    itemId: '',
    warehouseId: '',
    locationId: '',
    lotId: '',
    serialId: '',
    quantityOnHand: 0,
    quantityReserved: 0,
    quantityDamaged: 0,
    uom: '',
    status: 'AVAILABLE',
    unitCost: '',
    expiryDate: '',
    manufactureDate: '',
    attributes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchWarehouses();
      fetchLots();
      fetchSerials();

      if (mode === 'edit' && inventory) {
        // EDIT MODE - Populate form
        setFormData({
          itemId: inventory.itemId || '',
          warehouseId: inventory.warehouseId || '',
          locationId: inventory.locationId || '',
          lotId: inventory.lotId || '',
          serialId: inventory.serialId || '',
          quantityOnHand: inventory.quantityOnHand || 0,
          quantityReserved: inventory.quantityReserved || 0,
          quantityDamaged: inventory.quantityDamaged || 0,
          uom: inventory.uom || '',
          status: inventory.status || 'AVAILABLE',
          unitCost: inventory.unitCost?.toString() || '',
          expiryDate: inventory.expiryDate || '',
          manufactureDate: inventory.manufactureDate || '',
          attributes: inventory.attributes || '',
        });

        // Fetch locations for the selected warehouse
        if (inventory.warehouseId) {
          fetchLocationsByWarehouse(inventory.warehouseId);
        }
      } else {
        // CREATE MODE - Reset form
        setFormData({
          itemId: '',
          warehouseId: '',
          locationId: '',
          lotId: '',
          serialId: '',
          quantityOnHand: 0,
          quantityReserved: 0,
          quantityDamaged: 0,
          uom: '',
          status: 'AVAILABLE',
          unitCost: '',
          expiryDate: '',
          manufactureDate: '',
          attributes: '',
        });
        setLocations([]);
      }
    }
  }, [isOpen, mode, inventory]);

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      setItems(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await locationService.getWarehouses();
      setWarehouses(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchLocationsByWarehouse = async (warehouseId: string) => {
    try {
      const response = await locationService.getLocationsByWarehouse(warehouseId);
      setLocations(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchLots = async () => {
    try {
      const response = await inventoryService.getLots();
      setLots(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch lots:', error);
    }
  };

  const fetchSerials = async () => {
    try {
      const response = await inventoryService.getSerials();
      setSerials(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch serials:', error);
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setFormData({ ...formData, warehouseId, locationId: '' });
    if (warehouseId) {
      fetchLocationsByWarehouse(warehouseId);
    } else {
      setLocations([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        // CREATE REQUEST - Match InventoryCreateRequest DTO
        const createRequest = {
          itemId: formData.itemId,
          warehouseId: formData.warehouseId,
          locationId: formData.locationId,
          lotId: formData.lotId || null,
          serialId: formData.serialId || null,
          quantityOnHand: Number(formData.quantityOnHand),
          quantityReserved: Number(formData.quantityReserved) || 0,
          quantityDamaged: Number(formData.quantityDamaged) || 0,
          uom: formData.uom,
          status: formData.status,
          unitCost: formData.unitCost ? Number(formData.unitCost) : null,
          expiryDate: formData.expiryDate || null,
          manufactureDate: formData.manufactureDate || null,
          attributes: formData.attributes || null,
        };

        await inventoryService.createInventory(createRequest);
        toast.success('Inventory created successfully');
      } else {
        // UPDATE REQUEST - Match InventoryUpdateRequest DTO
        const updateRequest = {
          quantityOnHand: Number(formData.quantityOnHand),
          quantityReserved: Number(formData.quantityReserved),
          quantityDamaged: Number(formData.quantityDamaged),
          status: formData.status,
          unitCost: formData.unitCost ? Number(formData.unitCost) : null,
          expiryDate: formData.expiryDate || null,
          lastCountDate: null, // Could be added to form if needed
          attributes: formData.attributes || null,
        };

        await inventoryService.updateInventory(inventory!.id, updateRequest);
        toast.success('Inventory updated successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Inventory' : 'Create Inventory'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                required
                disabled={mode === 'edit'}
              >
                <option value="">Select an item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </Select>
            </div>

            {/* Warehouse - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.warehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                required
                disabled={mode === 'edit'}
              >
                <option value="">Select a warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Location - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                required
                disabled={!formData.warehouseId || mode === 'edit'}
              >
                <option value="">
                  {formData.warehouseId ? 'Select a location' : 'Select warehouse first'}
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Lot - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lot (Optional)</label>
              <Select value={formData.lotId} onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}>
                <option value="">No lot</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lotNumber}
                  </option>
                ))}
              </Select>
            </div>

            {/* Serial - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial (Optional)</label>
              <Select
                value={formData.serialId}
                onChange={(e) => setFormData({ ...formData, serialId: e.target.value })}
              >
                <option value="">No serial</option>
                {serials.map((serial) => (
                  <option key={serial.id} value={serial.id}>
                    {serial.serialNumber}
                  </option>
                ))}
              </Select>
            </div>

            {/* Quantity On Hand - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity On Hand <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.quantityOnHand}
                onChange={(e) => setFormData({ ...formData, quantityOnHand: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Quantity Reserved */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Reserved</label>
              <Input
                type="number"
                value={formData.quantityReserved}
                onChange={(e) => setFormData({ ...formData, quantityReserved: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>

            {/* Quantity Damaged */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Damaged</label>
              <Input
                type="number"
                value={formData.quantityDamaged}
                onChange={(e) => setFormData({ ...formData, quantityDamaged: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>

            {/* UOM - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit of Measure <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                required
                maxLength={20}
                placeholder="e.g., PIECE, KG, LITER"
              />
            </div>

            {/* Status - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="QUARANTINED">Quarantined</option>
                <option value="DAMAGED">Damaged</option>
              </Select>
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost</label>
              <Input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Future)</label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            {/* Manufacture Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacture Date (Past)</label>
              <Input
                type="date"
                value={formData.manufactureDate}
                onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
              />
            </div>

            {/* Attributes (JSON) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Attributes (JSON)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.attributes}
                onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                rows={3}
                placeholder='{"key": "value"}'
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Inventory' : 'Create Inventory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};