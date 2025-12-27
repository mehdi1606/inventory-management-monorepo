// src/components/quality-controls/QualityControlDetailModal.tsx
import React, { useState } from 'react';
import { QualityControl, QCStatus, QCType, Disposition } from '@/types';

interface QualityControlDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QualityControl | null;
  onStatusChange?: (id: string, status: QCStatus) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onEdit?: (data: QualityControl) => void;
  onDelete?: (id: string) => void;
}

export const QualityControlDetailModal: React.FC<QualityControlDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  onStatusChange,
  onApprove,
  onReject,
  onEdit,
  onDelete
}) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QCStatus | ''>('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen || !data) return null;

  const getStatusColor = (status: QCStatus) => {
    const colors = {
      [QCStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [QCStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [QCStatus.PASSED]: 'bg-green-100 text-green-800',
      [QCStatus.FAILED]: 'bg-red-100 text-red-800',
      [QCStatus.QUARANTINED]: 'bg-orange-100 text-orange-800',
      [QCStatus.CONDITIONAL_ACCEPT]: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDispositionColor = (disposition?: Disposition) => {
    if (!disposition) return 'bg-gray-100 text-gray-600';
    const colors = {
      [Disposition.ACCEPT]: 'bg-green-100 text-green-600',
      [Disposition.REJECT]: 'bg-red-100 text-red-600',
      [Disposition.REWORK]: 'bg-yellow-100 text-yellow-600',
      [Disposition.SCRAP]: 'bg-red-100 text-red-600',
      [Disposition.RETURN_TO_VENDOR]: 'bg-orange-100 text-orange-600',
      [Disposition.USE_AS_IS]: 'bg-blue-100 text-blue-600',
      [Disposition.QUARANTINE]: 'bg-orange-100 text-orange-600'
    };
    return colors[disposition] || 'bg-gray-100 text-gray-600';
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = () => {
    if (selectedStatus && onStatusChange) {
      onStatusChange(data.id, selectedStatus as QCStatus);
      setShowStatusDialog(false);
      setSelectedStatus('');
    }
  };

  const handleReject = () => {
    if (rejectReason.trim() && onReject) {
      onReject(data.id, rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
    }
  };

  const canChangeStatus = data.status !== QCStatus.PASSED && data.status !== QCStatus.FAILED;
  const canApprove = data.status === QCStatus.PASSED && !data.approvedBy;
  const canReject = data.status !== QCStatus.FAILED;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">Quality Control Details</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(data.status)}`}>
                    {data.status.replace(/_/g, ' ')}
                  </span>
                  {data.disposition && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDispositionColor(data.disposition)}`}>
                      {data.disposition.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-gray-600">
                  Inspection #: <span className="font-semibold">{data.inspectionNumber}</span>
                  {' • '}
                  Type: <span className="font-semibold">{data.inspectionType.replace(/_/g, ' ')}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {onStatusChange && canChangeStatus && (
                <button
                  onClick={() => setShowStatusDialog(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Change Status
                </button>
              )}
              {onApprove && canApprove && (
                <button
                  onClick={() => onApprove(data.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Approve
                </button>
              )}
              {onReject && canReject && (
                <button
                  onClick={() => setShowRejectDialog(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Reject
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(data)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this quality control?')) {
                      onDelete(data.id);
                    }
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Inspection Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Inspection Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Quantity Inspected</div>
                    <div className="text-2xl font-bold text-blue-600">{data.quantityInspected}</div>
                  </div>
                  {data.passedQuantity !== undefined && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Passed Quantity</div>
                      <div className="text-2xl font-bold text-green-600">{data.passedQuantity}</div>
                    </div>
                  )}
                  {data.failedQuantity !== undefined && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Failed Quantity</div>
                      <div className="text-2xl font-bold text-red-600">{data.failedQuantity}</div>
                    </div>
                  )}
                  {data.defectCount !== undefined && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Defect Count</div>
                      <div className="text-2xl font-bold text-orange-600">{data.defectCount}</div>
                    </div>
                  )}
                  {data.defectRate !== undefined && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Defect Rate</div>
                      <div className="text-2xl font-bold text-yellow-600">{(data.defectRate * 100).toFixed(2)}%</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Item Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Item ID</label>
                    <p className="text-base text-gray-900">{data.itemId}</p>
                  </div>
                  {data.lotId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Lot ID</label>
                      <p className="text-base text-gray-900">{data.lotId}</p>
                    </div>
                  )}
                  {data.serialNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Serial Number</label>
                      <p className="text-base text-gray-900">{data.serialNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Inspection Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Inspector ID</label>
                    <p className="text-base text-gray-900">{data.inspectorId}</p>
                  </div>
                  {data.inspectionLocationId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Inspection Location</label>
                      <p className="text-base text-gray-900">{data.inspectionLocationId}</p>
                    </div>
                  )}
                  {data.qualityProfileId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Quality Profile ID</label>
                      <p className="text-base text-gray-900">{data.qualityProfileId}</p>
                    </div>
                  )}
                  {data.samplingPlanId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Sampling Plan ID</label>
                      <p className="text-base text-gray-900">{data.samplingPlanId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timing Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Timing Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  {data.scheduledDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Scheduled Date</label>
                      <p className="text-base text-gray-900">{formatDateTime(data.scheduledDate)}</p>
                    </div>
                  )}
                  {data.startTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Start Time</label>
                      <p className="text-base text-gray-900">{formatDateTime(data.startTime)}</p>
                    </div>
                  )}
                  {data.endTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">End Time</label>
                      <p className="text-base text-gray-900">{formatDateTime(data.endTime)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes and Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Notes & Actions</h3>
                <div className="grid grid-cols-1 gap-6">
                  {data.inspectorNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Inspector Notes</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded">{data.inspectorNotes}</p>
                    </div>
                  )}
                  {data.correctiveAction && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Corrective Action</label>
                      <p className="text-base text-gray-900 bg-yellow-50 p-3 rounded">{data.correctiveAction}</p>
                    </div>
                  )}
                  {data.quarantineId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Quarantine ID</label>
                      <p className="text-base text-gray-900 bg-orange-50 p-3 rounded">{data.quarantineId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Information */}
              {data.approvedBy && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Approval Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Approved By</label>
                      <p className="text-base text-gray-900">{data.approvedBy}</p>
                    </div>
                    {data.approvedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Approved At</label>
                        <p className="text-base text-gray-900">{formatDateTime(data.approvedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Audit Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-base text-gray-900">{formatDateTime(data.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                    <p className="text-base text-gray-900">{formatDateTime(data.updatedAt)}</p>
                  </div>
                  {data.createdBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                      <p className="text-base text-gray-900">{data.createdBy}</p>
                    </div>
                  )}
                  {data.updatedBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Updated By</label>
                      <p className="text-base text-gray-900">{data.updatedBy}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Status Dialog */}
      {showStatusDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Change Inspection Status</h3>
            <label className="block text-sm font-medium mb-2">Select New Status *</label>
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as QCStatus)}
            >
              <option value="">Select Status</option>
              {Object.values(QCStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowStatusDialog(false);
                  setSelectedStatus('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={!selectedStatus}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reject Quality Control</h3>
            <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for rejection..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
