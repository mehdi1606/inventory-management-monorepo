// src/pages/inventory/SerialsPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Hash } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { Serial } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SerialFormModal } from '@/components/serials/SerialFormModal';
import { SerialDetailModal } from '@/components/serials/SerialDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';

export const SerialsPage = () => {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [filteredSerials, setFilteredSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<Serial | null>(null);

  // Fetch serials
  const fetchSerials = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getSerials();
      setSerials(data);
      setFilteredSerials(data);
    } catch (error) {
      toast.error('Failed to fetch serials');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSerials();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = serials;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (serial) =>
          serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          serial.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          serial.itemId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((serial) => serial.status === filterStatus);
    }

    // Location filter
    if (filterLocation) {
      filtered = filtered.filter((serial) => serial.locationId === filterLocation);
    }

    setFilteredSerials(filtered);
  }, [searchTerm, filterStatus, filterLocation, serials]);

  // Handlers
  const handleCreate = () => {
    setSelectedSerial(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (serial: Serial) => {
    setSelectedSerial(serial);
    setIsEditModalOpen(true);
  };

  const handleView = (serial: Serial) => {
    setSelectedSerial(serial);
    setIsDetailModalOpen(true);
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
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete serial');
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchSerials();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search serials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full"
          >
            <option value="">All Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DEFECTIVE">Defective</option>
            <option value="RETURNING">Returning</option>
            <option value="RETURNED">Returned</option>
          </Select>
          <Select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full"
          >
            <option value="">All Locations</option>
            {/* Add location options */}
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Serials</p>
              <p className="text-2xl font-bold text-gray-900">{serials.length}</p>
            </div>
            <Hash className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {serials.filter((s) => s.status === 'IN_STOCK').length}
              </p>
            </div>
            <Hash className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Allocated</p>
              <p className="text-2xl font-bold text-yellow-600">
                {serials.filter((s) => s.status === 'ALLOCATED').length}
              </p>
            </div>
            <Hash className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Defective</p>
              <p className="text-2xl font-bold text-red-600">
                {serials.filter((s) => s.status === 'DEFECTIVE').length}
              </p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {serial.serialNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{serial.code || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{serial.itemId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{serial.locationId || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            serial.status === 'IN_STOCK'
                              ? 'bg-green-100 text-green-800'
                              : serial.status === 'ALLOCATED'
                              ? 'bg-blue-100 text-blue-800'
                              : serial.status === 'SHIPPED'
                              ? 'bg-purple-100 text-purple-800'
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
                            onClick={() => handleView(serial)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
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

      {/* Modals */}
      <SerialFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <SerialFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="edit"
        serial={selectedSerial}
      />

      <SerialDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        serial={selectedSerial}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Serial"
        message={`Are you sure you want to delete serial "${selectedSerial?.serialNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};