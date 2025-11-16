// frontend/src/pages/inventory/SerialsPage.tsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Hash, MapPin } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

interface Serial {
  id: string;
  code: string;
  itemId: string;
  serialNumber: string;
  status: string;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}

export const SerialsPage: React.FC = () => {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedSerial, setSelectedSerial] = useState<Serial | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchSerials();
  }, []);

  const fetchSerials = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getSerials();
      setSerials(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to fetch serials');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSerial(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (serial: Serial) => {
    setSelectedSerial(serial);
    setIsEditModalOpen(true);
  };

  const handleDelete = (serial: Serial) => {
    setSelectedSerial(serial);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSerial) return;

    try {
      await inventoryService.deleteSerial(selectedSerial.id);
      toast.success('Serial deleted successfully');
      fetchSerials();
    } catch (error: any) {
      toast.error('Failed to delete serial');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSerial(null);
    }
  };

  const handleFormSuccess = () => {
    fetchSerials();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSerial(null);
  };

  const filteredSerials = serials.filter((serial) => {
    const matchesSearch =
      searchTerm === '' ||
      serial.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serial.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === '' || serial.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: serials.length,
    inStock: serials.filter((s) => s.status === 'IN_STOCK').length,
    sold: serials.filter((s) => s.status === 'SOLD').length,
    defective: serials.filter((s) => s.status === 'DEFECTIVE').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serial Number Management</h1>
          <p className="text-gray-600 mt-1">Track and manage serialized items</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          New Serial
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by serial number or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full">
            <option value="">All Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="SOLD">Sold</option>
            <option value="DEFECTIVE">Defective</option>
            <option value="RETURNING">Returning</option>
            <option value="SCRAPPED">Scrapped</option>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Serials</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Hash className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
            <Hash className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sold</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
            </div>
            <Hash className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Defective</p>
              <p className="text-2xl font-bold text-red-600">{stats.defective}</p>
            </div>
            <Hash className="text-red-500" size={32} />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSerials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No serials found
                    </td>
                  </tr>
                ) : (
                  filteredSerials.map((serial) => (
                    <tr key={serial.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{serial.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {serial.serialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{serial.itemId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{serial.locationId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            serial.status === 'IN_STOCK'
                              ? 'bg-green-100 text-green-800'
                              : serial.status === 'SOLD'
                              ? 'bg-blue-100 text-blue-800'
                              : serial.status === 'DEFECTIVE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {serial.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(serial)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(serial)}
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
      <SerialFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedSerial(null);
        }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      {/* Edit Modal */}
      <SerialFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSerial(null);
        }}
        onSuccess={handleFormSuccess}
        mode="edit"
        serial={selectedSerial}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedSerial(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Serial"
        message={`Are you sure you want to delete serial "${selectedSerial?.serialNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};

// ============================================================================
// SERIAL FORM MODAL COMPONENT
// ============================================================================

interface SerialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  serial?: Serial | null;
}

const SerialFormModal: React.FC<SerialFormModalProps> = ({ isOpen, onClose, onSuccess, mode, serial }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Form data matching backend DTOs
  const [formData, setFormData] = useState({
    itemId: '',
    code: '',
    serialNumber: '',
    status: 'IN_STOCK',
    locationId: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchLocations();

      if (mode === 'edit' && serial) {
        // EDIT MODE
        setFormData({
          itemId: serial.itemId || '',
          code: serial.code || '',
          serialNumber: serial.serialNumber || '',
          status: serial.status || 'IN_STOCK',
          locationId: serial.locationId || '',
        });
      } else {
        // CREATE MODE
        setFormData({
          itemId: '',
          code: '',
          serialNumber: '',
          status: 'IN_STOCK',
          locationId: '',
        });
      }
    }
  }, [isOpen, mode, serial]);

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      setItems(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      setLocations(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        // CREATE REQUEST - Match SerialCreateRequest DTO
        const createRequest = {
          itemId: formData.itemId,
          code: formData.code,
          serialNumber: formData.serialNumber,
          status: formData.status,
          locationId: formData.locationId || null,
        };

        await inventoryService.createSerial(createRequest);
        toast.success('Serial created successfully');
      } else {
        // UPDATE REQUEST - Match SerialUpdateRequest DTO
        const updateRequest = {
          serialNumber: formData.serialNumber,
          locationId: formData.locationId || null,
          status: formData.status,
        };

        await inventoryService.updateSerial(serial!.id, updateRequest);
        toast.success('Serial updated successfully');
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Serial' : 'Create Serial'}
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

            {/* Code - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                maxLength={100}
                placeholder="SN-2024-001"
                disabled={mode === 'edit'}
              />
            </div>

            {/* Serial Number - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                required
                maxLength={100}
                placeholder="ABC123XYZ789"
              />
            </div>

            {/* Status - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="SOLD">Sold</option>
                <option value="DEFECTIVE">Defective</option>
                <option value="RETURNING">Returning</option>
                <option value="SCRAPPED">Scrapped</option>
              </Select>
            </div>

            {/* Location - Optional */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
              <Select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              >
                <option value="">No location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Serial' : 'Create Serial'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};