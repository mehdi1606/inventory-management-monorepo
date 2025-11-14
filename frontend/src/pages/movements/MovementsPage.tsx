// src/pages/movements/MovementsPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, TruckIcon, PackageCheck, Play, CheckCircle, XCircle } from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { Movement } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MovementFormModal } from '@/components/movements/MovementFormModal';
import { MovementDetailModal } from '@/components/movements/MovementDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const MovementsPage = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  // Fetch movements
  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await movementService.getMovements();
      // Handle paginated response - extract the data array
      const movementsData = Array.isArray(response) ? response : (response.data || []);
      setMovements(movementsData);
      setFilteredMovements(movementsData);
    } catch (error) {
      toast.error('Failed to fetch movements');
      console.error(error);
      // Set empty arrays to prevent filter errors
      setMovements([]);
      setFilteredMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = movements || []; // Add fallback to empty array

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (movement) =>
          movement.movementNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter((movement) => movement.type === filterType);
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((movement) => movement.status === filterStatus);
    }

    // Warehouse filter
    if (filterWarehouse) {
      filtered = filtered.filter((movement) => movement.warehouseId === filterWarehouse);
    }

    setFilteredMovements(filtered);
  }, [searchTerm, filterType, filterStatus, filterWarehouse, movements]);

  // Handlers
  const handleCreate = () => {
    setSelectedMovement(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsEditModalOpen(true);
  };

  const handleView = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsDeleteDialogOpen(true);
  };

  const handleStart = async (movement: Movement) => {
    try {
      await movementService.startMovement(movement.id);
      toast.success('Movement started successfully');
      fetchMovements();
    } catch (error) {
      toast.error('Failed to start movement');
      console.error(error);
    }
  };

  const handleComplete = async (movement: Movement) => {
    try {
      await movementService.completeMovement(movement.id);
      toast.success('Movement completed successfully');
      fetchMovements();
    } catch (error) {
      toast.error('Failed to complete movement');
      console.error(error);
    }
  };

  const handleCancel = async (movement: Movement) => {
    try {
      await movementService.cancelMovement(movement.id, 'Cancelled by user');
      toast.success('Movement cancelled successfully');
      fetchMovements();
    } catch (error) {
      toast.error('Failed to cancel movement');
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMovement) return;

    try {
      await movementService.deleteMovement(selectedMovement.id);
      toast.success('Movement deleted successfully');
      fetchMovements();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete movement');
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchMovements();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return 'bg-green-100 text-green-800';
      case 'ISSUE':
        return 'bg-red-100 text-red-800';
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800';
      case 'ADJUSTMENT':
        return 'bg-purple-100 text-purple-800';
      case 'PICKING':
        return 'bg-orange-100 text-orange-800';
      case 'PUTAWAY':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movements Management</h1>
          <p className="text-gray-600 mt-1">Track and manage inventory movements</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          New Movement
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full"
          >
            <option value="">All Types</option>
            <option value="RECEIPT">Receipt</option>
            <option value="ISSUE">Issue</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="PICKING">Picking</option>
            <option value="PUTAWAY">Putaway</option>
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="w-full"
          >
            <option value="">All Warehouses</option>
            {/* Add warehouse options */}
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Movements</p>
              <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
            </div>
            <TruckIcon className="text-gray-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {movements.filter((m) => m.status === 'PENDING').length}
              </p>
            </div>
            <PackageCheck className="text-yellow-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {movements.filter((m) => m.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <Play className="text-blue-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {movements.filter((m) => m.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
      </div>

      {/* Movements Table */}
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
                    Movement #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From → To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No movements found
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {movement.movementNumber || movement.referenceNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.referenceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(movement.type)}`}>
                          {movement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {movement.fromLocation?.name || movement.sourceLocationId || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ↓ {movement.toLocation?.name || movement.destinationLocationId || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {movement.movementDate
                            ? format(new Date(movement.movementDate), 'MMM dd, yyyy')
                            : '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.expectedDate
                            ? format(new Date(movement.expectedDate), 'MMM dd')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            movement.priority === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : movement.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {movement.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(movement.status)}`}>
                          {movement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${movement.completionPercentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{movement.completionPercentage || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(movement)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(movement)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          {movement.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStart(movement)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Start"
                            >
                              <Play size={18} />
                            </button>
                          )}
                          {movement.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => handleComplete(movement)}
                                className="text-green-600 hover:text-green-900"
                                title="Complete"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleCancel(movement)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Cancel"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(movement)}
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
      {isCreateModalOpen && (
        <MovementFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {isEditModalOpen && selectedMovement && (
        <MovementFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleFormSuccess}
          movement={selectedMovement}
        />
      )}

      {isDetailModalOpen && selectedMovement && (
        <MovementDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          movement={selectedMovement}
        />
      )}

      {isDeleteDialogOpen && selectedMovement && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Movement"
          description={`Are you sure you want to delete movement ${selectedMovement.movementNumber || selectedMovement.referenceNumber}? This action cannot be undone.`}
        />
      )}
    </div>
  );
};
