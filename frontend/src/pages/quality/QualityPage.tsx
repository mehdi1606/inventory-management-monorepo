// src/pages/quality/QualityControlsPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, XCircle, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { qualityService } from '@/services/quality.service';
import { QualityControl } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { QualityControlFormModal } from '@/components/quality-controls/QualityControlFormModal';
import { QualityControlDetailModal } from '@/components/quality-controls/QualityControlDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const QualityControlsPage = () => {
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [filteredQualityControls, setFilteredQualityControls] = useState<QualityControl[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState<QualityControl | null>(null);

  // Fetch quality controls
  const fetchQualityControls = async () => {
    setLoading(true);
    try {
      const data = await qualityService.getQualityControls();
      setQualityControls(data);
      setFilteredQualityControls(data);
    } catch (error) {
      toast.error('Failed to fetch quality controls');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityControls();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = qualityControls;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (qc) =>
          qc.controlNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qc.itemId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((qc) => qc.status === filterStatus);
    }

    // Result filter
    if (filterResult === 'passed') {
      filtered = filtered.filter((qc) => qc.passed === true);
    } else if (filterResult === 'failed') {
      filtered = filtered.filter((qc) => qc.passed === false);
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter((qc) => qc.inspectionType === filterType);
    }

    setFilteredQualityControls(filtered);
  }, [searchTerm, filterStatus, filterResult, filterType, qualityControls]);

  // Handlers
  const handleCreate = () => {
    setSelectedQC(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (qc: QualityControl) => {
    setSelectedQC(qc);
    setIsEditModalOpen(true);
  };

  const handleView = (qc: QualityControl) => {
    setSelectedQC(qc);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (qc: QualityControl) => {
    setSelectedQC(qc);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = async (qc: QualityControl) => {
    try {
      await qualityService.approveQualityControl(qc.id);
      toast.success('Quality control approved successfully');
      fetchQualityControls();
    } catch (error) {
      toast.error('Failed to approve quality control');
      console.error(error);
    }
  };

  const handleReject = async (qc: QualityControl) => {
    try {
      await qualityService.rejectQualityControl(qc.id, 'Failed inspection');
      toast.success('Quality control rejected successfully');
      fetchQualityControls();
    } catch (error) {
      toast.error('Failed to reject quality control');
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedQC) return;

    try {
      await qualityService.deleteQualityControl(selectedQC.id);
      toast.success('Quality control deleted successfully');
      fetchQualityControls();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete quality control');
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchQualityControls();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PASSED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Control Inspections</h1>
          <p className="text-gray-600 mt-1">Manage quality inspections and testing</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          New Inspection
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search inspections..."
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
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
            <option value="COMPLETED">Completed</option>
          </Select>
          <Select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="w-full"
          >
            <option value="">All Results</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </Select>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full"
          >
            <option value="">All Types</option>
            <option value="RECEIVING">Receiving</option>
            <option value="IN_PROCESS">In-Process</option>
            <option value="FINAL">Final</option>
            <option value="SAMPLING">Sampling</option>
            <option value="VISUAL">Visual</option>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold text-gray-900">{qualityControls.length}</p>
            </div>
            <ClipboardCheck className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {qualityControls.filter((qc) => qc.status === 'PENDING').length}
              </p>
            </div>
            <ClipboardCheck className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {qualityControls.filter((qc) => qc.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <ClipboardCheck className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-green-600">
                {qualityControls.filter((qc) => qc.passed === true).length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {qualityControls.filter((qc) => qc.passed === false).length}
              </p>
            </div>
            <XCircle className="text-red-500" size={32} />
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
                    Control #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot/Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tested Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
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
                {filteredQualityControls.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No quality controls found
                    </td>
                  </tr>
                ) : (
                  filteredQualityControls.map((qc) => (
                    <tr key={qc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClipboardCheck className="text-gray-400 mr-2" size={16} />
                          <div className="text-sm font-medium text-gray-900">
                            {qc.controlNumber || qc.id.slice(0, 8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {qc.item?.name || qc.itemId}
                        </div>
                        <div className="text-sm text-gray-500">{qc.item?.sku || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {qc.inspectionType || 'GENERAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {qc.lot?.lotNumber || qc.serial?.serialNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{qc.testedBy || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {qc.testedDate ? format(new Date(qc.testedDate), 'MMM dd, yyyy') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {qc.passed === true && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle size={14} className="mr-1" />
                            PASSED
                          </span>
                        )}
                        {qc.passed === false && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <XCircle size={14} className="mr-1" />
                            FAILED
                          </span>
                        )}
                        {qc.passed === null && (
                          <span className="text-sm text-gray-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(qc.status)}`}>
                          {qc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(qc)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          {qc.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => handleApprove(qc)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve/Pass"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(qc)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject/Fail"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {(qc.status === 'PENDING' || qc.status === 'IN_PROGRESS') && (
                            <button
                              onClick={() => handleEdit(qc)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(qc)}
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
      <QualityControlFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <QualityControlFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="edit"
        qualityControl={selectedQC}
      />

      <QualityControlDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        qualityControl={selectedQC}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Quality Control"
        message={`Are you sure you want to delete quality control "${selectedQC?.controlNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};