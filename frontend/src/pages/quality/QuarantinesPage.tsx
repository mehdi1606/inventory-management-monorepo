import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { qualityService } from '@/services/quality.service';
import { Quarantine } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const QuarantinesPage = () => {
  const [quarantines, setQuarantines] = useState<Quarantine[]>([]);
  const [filteredQuarantines, setFilteredQuarantines] = useState<Quarantine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuarantine, setSelectedQuarantine] = useState<Quarantine | null>(null);

  // Fetch quarantines
  const fetchQuarantines = async () => {
    setLoading(true);
    try {
      const response = await qualityService.getQuarantines();
      const data = response.content || [];
      setQuarantines(data);
      setFilteredQuarantines(data);
    } catch (error) {
      toast.error('Failed to fetch quarantines');
      console.error(error);
      setQuarantines([]);
      setFilteredQuarantines([]);
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

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.lotId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((q) => q.status === filterStatus);
    }

    if (filterSeverity) {
      filtered = filtered.filter((q) => q.severity === filterSeverity);
    }

    setFilteredQuarantines(filtered);
  }, [searchTerm, filterStatus, filterSeverity, quarantines]);

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
    } catch (error) {
      toast.error('Failed to delete quarantine');
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedQuarantine(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      IN_PROCESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      QUARANTINED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      RELEASED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.IN_PROCESS}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[severity] || colors.MEDIUM}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Quarantines
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage quarantined items and track their status
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          New Quarantine
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Quarantines</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {quarantines.length}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">In Process</p>
              <p className="text-2xl font-bold text-yellow-600">
                {quarantines.filter((q) => q.status === 'IN_PROCESS').length}
              </p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Released</p>
              <p className="text-2xl font-bold text-green-600">
                {quarantines.filter((q) => q.status === 'RELEASED').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {quarantines.filter((q) => q.status === 'REJECTED').length}
              </p>
            </div>
            <XCircle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search quarantines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="IN_PROCESS">In Process</option>
            <option value="QUARANTINED">Quarantined</option>
            <option value="RELEASED">Released</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <Select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Lot/Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Expected Release
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredQuarantines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                      No quarantines found
                    </td>
                  </tr>
                ) : (
                  filteredQuarantines.map((quarantine) => (
                    <tr key={quarantine.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                        {quarantine.itemId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                        {quarantine.lotId || quarantine.serialNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                        {quarantine.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {quarantine.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(quarantine.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(quarantine.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                        {quarantine.expectedReleaseDate
                          ? format(new Date(quarantine.expectedReleaseDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(quarantine)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(quarantine)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(quarantine)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedQuarantine(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Quarantine"
        message={`Are you sure you want to delete this quarantine for item "${selectedQuarantine?.itemId}"? This action cannot be undone.`}
      />
    </div>
  );
};