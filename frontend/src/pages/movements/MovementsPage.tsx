// src/pages/movements/MovementsPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Play, CheckCircle, XCircle, Pause, AlertCircle, Clock, Package } from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { Movement, MovementStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MovementFormModal } from '@/components/movements/MovementFormModal';
import { MovementDetailModal } from '@/components/movements/MovementDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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

  // Statistics
  const [stats, setStats] = useState({
    totalMovements: 0,
    pendingMovements: 0,
    inProgressMovements: 0,
    completedMovements: 0,
    cancelledMovements: 0,
    onHoldMovements: 0,
  });

  useEffect(() => {
    fetchMovements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterStatus, filterWarehouse, movements]);

  // Fetch movements
  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await movementService.getMovements();
      const movementsData = Array.isArray(response) ? response : response?.content || [];
      setMovements(movementsData);
      calculateStats(movementsData);
    } catch (error) {
      toast.error('Failed to fetch movements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data: Movement[]) => {
    setStats({
      totalMovements: data.length,
      pendingMovements: data.filter(m => m.status === MovementStatus.PENDING).length,
      inProgressMovements: data.filter(m => m.status === MovementStatus.IN_PROGRESS).length,
      completedMovements: data.filter(m => m.status === MovementStatus.COMPLETED).length,
      cancelledMovements: data.filter(m => m.status === MovementStatus.CANCELLED).length,
      onHoldMovements: data.filter(m => m.status === MovementStatus.ON_HOLD).length,
    });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...movements];

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter((m) => m.type === filterType);
    }

    if (filterStatus) {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    if (filterWarehouse) {
      filtered = filtered.filter((m) => m.warehouseId === filterWarehouse);
    }

    setFilteredMovements(filtered);
  };

  // Handlers
  const handleCreate = () => {
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

  const confirmDelete = async () => {
    if (!selectedMovement) return;

    try {
      await movementService.deleteMovement(selectedMovement.id);
      toast.success('Movement deleted successfully');
      fetchMovements();
      setIsDeleteDialogOpen(false);
      setSelectedMovement(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete movement');
      console.error(error);
    }
  };

  const handleStart = async (movementId: string) => {
    try {
      await movementService.startMovement(movementId);
      toast.success('Movement started successfully');
      fetchMovements();
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start movement');
      console.error(error);
    }
  };

  const handleComplete = async (movementId: string) => {
    try {
      await movementService.completeMovement(movementId);
      toast.success('Movement completed successfully');
      fetchMovements();
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete movement');
      console.error(error);
    }
  };

  const handleCancel = async (movementId: string, reason: string) => {
    try {
      await movementService.cancelMovement(movementId, reason);
      toast.success('Movement cancelled successfully');
      fetchMovements();
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel movement');
      console.error(error);
    }
  };

  const handleHold = async (movementId: string, reason: string) => {
    try {
      await movementService.holdMovement(movementId, reason);
      toast.success('Movement put on hold');
      fetchMovements();
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to hold movement');
      console.error(error);
    }
  };

  const handleRelease = async (movementId: string) => {
    try {
      await movementService.releaseMovement(movementId);
      toast.success('Movement released from hold');
      fetchMovements();
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to release movement');
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchMovements();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedMovement(null);
  };

  // Status badge color
  const getStatusColor = (status: MovementStatus) => {
    const colors = {
      [MovementStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      [MovementStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [MovementStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [MovementStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [MovementStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      [MovementStatus.ON_HOLD]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Movements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage stock movements and transfers across warehouses
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Plus size={20} />
              <span>Create Movement</span>
            </Button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalMovements}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {stats.inProgressMovements}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.completedMovements}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">On Hold</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {stats.onHoldMovements}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Pause className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-neutral-700"
        >
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

            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="INBOUND">Inbound</option>
              <option value="OUTBOUND">Outbound</option>
              <option value="TRANSFER">Transfer</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="RETURN">Return</option>
            </Select>

            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ON_HOLD">On Hold</option>
            </Select>

            <Select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)}>
              <option value="">All Warehouses</option>
            </Select>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-700 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No movements found</p>
              <p className="text-sm mt-2">Create your first movement to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-gray-50 dark:bg-neutral-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lines
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredMovements.map((movement) => (
                    <tr
                      key={movement.id}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {movement.referenceNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {movement.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(movement.status)}`}>
                          {movement.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {movement.priority}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {format(new Date(movement.movementDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {movement.lines?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(movement)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          {(movement.status === MovementStatus.DRAFT || movement.status === MovementStatus.PENDING) && (
                            <button
                              onClick={() => handleEdit(movement)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          {(movement.status === MovementStatus.PENDING || movement.status === MovementStatus.DRAFT) && (
                            <button
                              onClick={() => handleStart(movement.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Start"
                            >
                              <Play size={18} />
                            </button>
                          )}
                          {movement.status === MovementStatus.IN_PROGRESS && (
                            <button
                              onClick={() => handleComplete(movement.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Complete"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {(movement.status === MovementStatus.DRAFT || movement.status === MovementStatus.CANCELLED) && (
                            <button
                              onClick={() => handleDelete(movement)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Modals */}
        <MovementFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleFormSuccess}
        />

        <MovementFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleFormSuccess}
          initialData={selectedMovement}
        />

        <MovementDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          data={selectedMovement}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStart={handleStart}
          onComplete={handleComplete}
          onCancel={handleCancel}
          onHold={handleHold}
          onRelease={handleRelease}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Movement"
          message="Are you sure you want to delete this movement? This action cannot be undone."
        />
      </div>
    </div>
  );
};