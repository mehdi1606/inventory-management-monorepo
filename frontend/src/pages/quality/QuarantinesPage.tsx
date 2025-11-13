// src/pages/quality/QuarantinesPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Lock, Unlock, AlertTriangle, Clock } from 'lucide-react';
import { qualityService } from '@/services/quality.service';
import { Quarantine } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { QuarantineFormModal } from '@/components/quarantines/QuarantineFormModal';
import { QuarantineDetailModal } from '@/components/quarantines/QuarantineDetailModal';
import { ReleaseQuarantineModal } from '@/components/quarantines/ReleaseQuarantineModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

export const QuarantinesPage = () => {
  const [quarantines, setQuarantines] = useState<Quarantine[]>([]);
  const [filteredQuarantines, setFilteredQuarantines] = useState<Quarantine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuarantine, setSelectedQuarantine] = useState<Quarantine | null>(null);

  // Fetch quarantines
  const fetchQuarantines = async () => {
    setLoading(true);
    try {
      const data = await qualityService.getQuarantines();
      setQuarantines(data);
      setFilteredQuarantines(data);
    } catch (error) {
      toast.error('Failed to fetch quarantines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuarantines();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = quarantines;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.quarantineNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((q) => q.status === filterStatus);
    }

    // Location filter
    if (filterLocation) {
      filtered = filtered.filter((q) => q.locationId === filterLocation);
    }

    setFilteredQuarantines(filtered);
  }, [searchTerm, filterStatus, filterLocation, quarantines]);

  // Calculate quarantine duration
  const getQuarantineDuration = (quarantinedDate: string, releasedDate?: string) => {
    const start = new Date(quarantinedDate);
    const end = releasedDate ? new Date(releasedDate) : new Date();
    return differenceInDays(end, start);
  };

  // Handlers
  const handleCreate = () => {
    setSelectedQuarantine(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (quarantine: Quarantine) => {
    setSelectedQuarantine(quarantine);
    setIsEditModalOpen(true);
  };

  const handleView = (quarantine: Quarantine) => {
    setSelectedQuarantine(quarantine);
    setIsDetailModalOpen(true);
  };

  const handleRelease = (quarantine: Quarantine) => {
    setSelectedQuarantine(quarantine);
    setIsReleaseModalOpen(true);
  };

  const handleDelete = (quarantine: Quarantine) => {
    setSelectedQuarantine(quarantine);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuarantine) return;

    try {
      await qualityService.deleteQuarantine(selectedQuarantine.id);
      toast.success('Quarantine deleted successfully');
      fetchQuarantines();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete quarantine');
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchQuarantines();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsReleaseModalOpen(false);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROCESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'QUARANTINED':
        return 'bg-red-100 text-red-800';
      case 'RELEASED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quarantine Management</h1>
          <p className="text-gray-600 mt-1">Track and manage quarantined items</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          New Quarantine
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search quarantines..."
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
            <option value="IN_PROCESS">In Process</option>
            <option value="QUARANTINED">Quarantined</option>
            <option value="RELEASED">Released</option>
            <option value="REJECTED">Rejected</option>
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
              <p className="text-sm text-gray-600">Total Quarantines</p>
              <p className="text-2xl font-bold text-gray-900">{quarantines.length}</p>
            </div>
            <Lock className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-red-600">
                {quarantines.filter((q) => q.status === 'QUARANTINED' || q.status === 'IN_PROCESS').length}
              </p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Released</p>
              <p className="text-2xl font-bold text-green-600">
                {quarantines.filter((q) => q.status === 'RELEASED').length}
              </p>
            </div>
            <Unlock className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-purple-600">
                {quarantines.length > 0
                  ? Math.round(
                      quarantines.reduce((sum, q) => sum + getQuarantineDuration(q.quarantinedDate, q.releasedDate), 0) /
                        quarantines.length
                    )
                  : 0}{' '}
                days
              </p>
            </div>
            <Clock className="text-purple-500" size={32} />
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
                    Quarantine #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot/Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quarantined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                {filteredQuarantines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No quarantines found
                    </td>
                  </tr>
                ) : (
                  filteredQuarantines.map((quarantine) => (
                    <tr key={quarantine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Lock className="text-gray-400 mr-2" size={16} />
                          <div className="text-sm font-medium text-gray-900">
                            {quarantine.quarantineNumber || quarantine.id.slice(0, 8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {quarantine.item?.name || quarantine.itemId}
                        </div>
                        <div className="text-sm text-gray-500">{quarantine.item?.sku || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {quarantine.lot?.lotNumber || quarantine.serial?.serialNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{quarantine.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{quarantine.locationId || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(quarantine.quarantinedDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={14} className="text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {getQuarantineDuration(quarantine.quarantinedDate, quarantine.releasedDate)} days
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quarantine.status)}`}>
                          {quarantine.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(quarantine)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          {(quarantine.status === 'IN_PROCESS' || quarantine.status === 'QUARANTINED') && (
                            <>
                              <button
                                onClick={() => handleRelease(quarantine)}
                                className="text-green-600 hover:text-green-900"
                                title="Release"
                              >
                                <Unlock size={18} />
                              </button>
                              <button
                                onClick={() => handleEdit(quarantine)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(quarantine)}
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
      <QuarantineFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <QuarantineFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="edit"
        quarantine={selectedQuarantine}
      />

      <ReleaseQuarantineModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        onSuccess={handleFormSuccess}
        quarantine={selectedQuarantine}
      />

      <QuarantineDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        quarantine={selectedQuarantine}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Quarantine"
        message={`Are you sure you want to delete quarantine "${selectedQuarantine?.quarantineNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};