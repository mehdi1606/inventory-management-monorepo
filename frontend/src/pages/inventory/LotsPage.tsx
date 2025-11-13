// src/pages/inventory/LotsPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, Calendar } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { Lot } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LotFormModal } from '@/components/lots/LotFormModal';
import { LotDetailModal } from '@/components/lots/LotDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

export const LotsPage = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterExpiry, setFilterExpiry] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  // Fetch lots
  const fetchLots = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getLots();
      setLots(data);
      setFilteredLots(data);
    } catch (error) {
      toast.error('Failed to fetch lots');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = lots;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (lot) =>
          lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lot.itemId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((lot) => lot.status === filterStatus);
    }

    // Expiry filter
    if (filterExpiry) {
      const today = new Date();
      filtered = filtered.filter((lot) => {
        if (!lot.expiryDate) return false;
        const expiryDate = new Date(lot.expiryDate);
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        switch (filterExpiry) {
          case 'expired':
            return daysUntilExpiry < 0;
          case 'expiring-soon':
            return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
          case 'valid':
            return daysUntilExpiry > 30;
          default:
            return true;
        }
      });
    }

    setFilteredLots(filtered);
  }, [searchTerm, filterStatus, filterExpiry, lots]);

  // Calculate expiry status
  const getExpiryStatus = (expiryDate: string | undefined) => {
    if (!expiryDate) return { text: 'No expiry', color: 'gray' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) {
      return { text: 'Expired', color: 'red' };
    } else if (daysUntilExpiry <= 30) {
      return { text: `${daysUntilExpiry} days left`, color: 'yellow' };
    } else {
      return { text: format(expiry, 'MMM dd, yyyy'), color: 'green' };
    }
  };

  // Handlers
  const handleCreate = () => {
    setSelectedLot(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (lot: Lot) => {
    setSelectedLot(lot);
    setIsEditModalOpen(true);
  };

  const handleView = (lot: Lot) => {
    setSelectedLot(lot);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (lot: Lot) => {
    setSelectedLot(lot);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLot) return;

    try {
      await inventoryService.deleteLot(selectedLot.id);
      toast.success('Lot deleted successfully');
      fetchLots();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete lot');
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchLots();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lot Management</h1>
          <p className="text-gray-600 mt-1">Track and manage product lots</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          New Lot
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search lots..."
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
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="QUARANTINE">Quarantine</option>
            <option value="CONSUMED">Consumed</option>
          </Select>
          <Select
            value={filterExpiry}
            onChange={(e) => setFilterExpiry(e.target.value)}
            className="w-full"
          >
            <option value="">All Expiry Status</option>
            <option value="expired">Expired</option>
            <option value="expiring-soon">Expiring Soon (30 days)</option>
            <option value="valid">Valid</option>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lots</p>
              <p className="text-2xl font-bold text-gray-900">{lots.length}</p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {lots.filter((l) => l.status === 'ACTIVE').length}
              </p>
            </div>
            <Calendar className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  lots.filter((lot) => {
                    if (!lot.expiryDate) return false;
                    const days = differenceInDays(new Date(lot.expiryDate), new Date());
                    return days >= 0 && days <= 30;
                  }).length
                }
              </p>
            </div>
            <AlertCircle className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  lots.filter((lot) => {
                    if (!lot.expiryDate) return false;
                    return differenceInDays(new Date(lot.expiryDate), new Date()) < 0;
                  }).length
                }
              </p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
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
                    Lot Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manufacture Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
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
                {filteredLots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No lots found
                    </td>
                  </tr>
                ) : (
                  filteredLots.map((lot) => {
                    const expiryStatus = getExpiryStatus(lot.expiryDate);
                    return (
                      <tr key={lot.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lot.lotNumber}</div>
                          <div className="text-sm text-gray-500">{lot.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lot.itemId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {lot.manufactureDate
                              ? format(new Date(lot.manufactureDate), 'MMM dd, yyyy')
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${
                              expiryStatus.color === 'red'
                                ? 'text-red-600'
                                : expiryStatus.color === 'yellow'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {expiryStatus.text}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              lot.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : lot.status === 'EXPIRED'
                                ? 'bg-red-100 text-red-800'
                                : lot.status === 'QUARANTINE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {lot.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleView(lot)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(lot)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(lot)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <LotFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <LotFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="edit"
        lot={selectedLot}
      />

      <LotDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        lot={selectedLot}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Lot"
        message={`Are you sure you want to delete lot "${selectedLot?.lotNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};