// src/components/movements/MovementDetailModal.tsx
import React, { useState } from 'react';
import { Movement, MovementLine, MovementTask, MovementStatus, MovementPriority, LineStatus, TaskStatus } from '@/types';

interface MovementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Movement | null;
  onEdit?: (movement: Movement) => void;
  onDelete?: (movementId: string) => void;
  onStart?: (movementId: string) => void;
  onComplete?: (movementId: string) => void;
  onCancel?: (movementId: string, reason: string) => void;
  onHold?: (movementId: string, reason: string) => void;
  onRelease?: (movementId: string) => void;
}

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel,
  onHold,
  onRelease
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'lines' | 'tasks'>('details');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [holdReason, setHoldReason] = useState('');

  if (!isOpen || !data) return null;

  const getStatusColor = (status: MovementStatus) => {
    const colors = {
      [MovementStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [MovementStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [MovementStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
      [MovementStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [MovementStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [MovementStatus.ON_HOLD]: 'bg-orange-100 text-orange-800',
      [MovementStatus.PARTIALLY_COMPLETED]: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: MovementPriority) => {
    const colors = {
      [MovementPriority.LOW]: 'bg-gray-100 text-gray-600',
      [MovementPriority.NORMAL]: 'bg-blue-100 text-blue-600',
      [MovementPriority.HIGH]: 'bg-yellow-100 text-yellow-600',
      [MovementPriority.URGENT]: 'bg-orange-100 text-orange-600',
      [MovementPriority.CRITICAL]: 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const getLineStatusColor = (status: LineStatus) => {
    const colors = {
      [LineStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [LineStatus.ALLOCATED]: 'bg-blue-100 text-blue-800',
      [LineStatus.PICKED]: 'bg-purple-100 text-purple-800',
      [LineStatus.PACKED]: 'bg-indigo-100 text-indigo-800',
      [LineStatus.IN_TRANSIT]: 'bg-yellow-100 text-yellow-800',
      [LineStatus.RECEIVED]: 'bg-green-100 text-green-800',
      [LineStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [LineStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [LineStatus.SHORT_PICKED]: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [TaskStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
      [TaskStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [TaskStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [TaskStatus.FAILED]: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const handleCancelSubmit = () => {
    if (cancelReason.trim() && onCancel) {
      onCancel(data.id, cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  const handleHoldSubmit = () => {
    if (holdReason.trim() && onHold) {
      onHold(data.id, holdReason);
      setShowHoldDialog(false);
      setHoldReason('');
    }
  };

  const canEdit = data.status === MovementStatus.DRAFT || data.status === MovementStatus.PENDING;
  const canDelete = data.status === MovementStatus.DRAFT || data.status === MovementStatus.CANCELLED;
  const canStart = data.status === MovementStatus.PENDING || data.status === MovementStatus.DRAFT;
  const canComplete = data.status === MovementStatus.IN_PROGRESS || data.status === MovementStatus.PARTIALLY_COMPLETED;
  const canCancel = data.status !== MovementStatus.COMPLETED && data.status !== MovementStatus.CANCELLED;
  const canHold = data.status === MovementStatus.IN_PROGRESS || data.status === MovementStatus.PENDING;
  const canRelease = data.status === MovementStatus.ON_HOLD;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">Movement Details</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(data.status)}`}>
                    {data.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(data.priority)}`}>
                    {data.priority}
                  </span>
                </div>
                <p className="text-gray-600">
                  Reference: <span className="font-semibold">{data.referenceNumber || 'N/A'}</span>
                  {' • '}
                  Type: <span className="font-semibold">{data.type.replace(/_/g, ' ')}</span>
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
              {onEdit && canEdit && (
                <button
                  onClick={() => onEdit(data)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Edit
                </button>
              )}
              {onStart && canStart && (
                <button
                  onClick={() => onStart(data.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Start Movement
                </button>
              )}
              {onComplete && canComplete && (
                <button
                  onClick={() => onComplete(data.id)}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                >
                  Complete Movement
                </button>
              )}
              {onRelease && canRelease && (
                <button
                  onClick={() => onRelease(data.id)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                >
                  Release from Hold
                </button>
              )}
              {onHold && canHold && (
                <button
                  onClick={() => setShowHoldDialog(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                >
                  Put on Hold
                </button>
              )}
              {onCancel && canCancel && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Cancel Movement
                </button>
              )}
              {onDelete && canDelete && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this movement?')) {
                      onDelete(data.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-6">
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === 'lines'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('lines')}
            >
              Lines ({data.lines?.length || 0})
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks ({data.tasks?.length || 0})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Lines</div>
                    <div className="text-2xl font-bold text-blue-600">{data.totalLines || data.lines?.length || 0}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Completed Lines</div>
                    <div className="text-2xl font-bold text-green-600">{data.completedLines || 0}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Pending Tasks</div>
                    <div className="text-2xl font-bold text-orange-600">{data.pendingTasks || 0}</div>
                  </div>
                </div>

                {/* Movement Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Movement Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Movement Type</label>
                      <p className="text-base font-semibold text-gray-900">{data.type.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Warehouse ID</label>
                      <p className="text-base text-gray-900">{data.warehouseId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Source Location</label>
                      <p className="text-base text-gray-900">{data.sourceLocationId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Destination Location</label>
                      <p className="text-base text-gray-900">{data.destinationLocationId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Dates & Timeline</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Movement Date</label>
                      <p className="text-base text-gray-900">{formatDateTime(data.movementDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Expected Date</label>
                      <p className="text-base text-gray-900">{formatDateTime(data.expectedDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Scheduled Date</label>
                      <p className="text-base text-gray-900">{formatDateTime(data.scheduledDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Actual Date</label>
                      <p className="text-base text-gray-900">{formatDateTime(data.actualDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {data.notes && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                        <p className="text-base text-gray-900 bg-gray-50 p-3 rounded">{data.notes}</p>
                      </div>
                    )}
                    {data.reason && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Reason</label>
                        <p className="text-base text-gray-900 bg-gray-50 p-3 rounded">{data.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

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
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                      <p className="text-base text-gray-900">{data.createdBy || 'N/A'}</p>
                    </div>
                    {data.completedBy && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Completed By</label>
                        <p className="text-base text-gray-900">{data.completedBy}</p>
                      </div>
                    )}
                    {data.completedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Completed At</label>
                        <p className="text-base text-gray-900">{formatDateTime(data.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lines Tab */}
            {activeTab === 'lines' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Movement Lines</h3>
                {!data.lines || data.lines.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No lines found for this movement.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.lines.map((line: MovementLine) => (
                      <div key={line.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900">Line #{line.lineNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLineStatusColor(line.status)}`}>
                              {line.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Requested</div>
                            <div className="text-lg font-bold text-blue-600">
                              {line.requestedQuantity} {line.uom || ''}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Item ID:</span>
                            <span className="ml-2 font-medium">{line.itemId}</span>
                          </div>
                          {line.actualQuantity !== undefined && (
                            <div>
                              <span className="text-gray-500">Actual Qty:</span>
                              <span className="ml-2 font-medium">{line.actualQuantity} {line.uom || ''}</span>
                            </div>
                          )}
                          {line.varianceQuantity !== undefined && line.varianceQuantity !== 0 && (
                            <div>
                              <span className="text-gray-500">Variance:</span>
                              <span className={`ml-2 font-medium ${line.varianceQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {line.varianceQuantity > 0 ? '+' : ''}{line.varianceQuantity} {line.uom || ''}
                              </span>
                            </div>
                          )}
                          {line.fromLocationId && (
                            <div>
                              <span className="text-gray-500">From:</span>
                              <span className="ml-2 font-medium">{line.fromLocationId}</span>
                            </div>
                          )}
                          {line.toLocationId && (
                            <div>
                              <span className="text-gray-500">To:</span>
                              <span className="ml-2 font-medium">{line.toLocationId}</span>
                            </div>
                          )}
                          {line.lotId && (
                            <div>
                              <span className="text-gray-500">Lot:</span>
                              <span className="ml-2 font-medium">{line.lotId}</span>
                            </div>
                          )}
                          {line.serialId && (
                            <div>
                              <span className="text-gray-500">Serial:</span>
                              <span className="ml-2 font-medium">{line.serialId}</span>
                            </div>
                          )}
                        </div>

                        {line.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <span className="text-gray-500 font-medium">Notes: </span>
                            {line.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Movement Tasks</h3>
                {!data.tasks || data.tasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No tasks assigned to this movement.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.tasks.map((task: MovementTask, index: number) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900">Task #{index + 1}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTaskStatusColor(task.status)}`}>
                              {task.status.replace(/_/g, ' ')}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                              {task.taskType.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Priority:</span>
                            <span className={`px-2 py-1 rounded text-sm font-bold ${
                              task.priority >= 8 ? 'bg-red-100 text-red-600' :
                              task.priority >= 6 ? 'bg-orange-100 text-orange-600' :
                              task.priority >= 4 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {task.priority}/10
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          {task.assignedUserId && (
                            <div>
                              <span className="text-gray-500">Assigned To:</span>
                              <span className="ml-2 font-medium">{task.assignedUserId}</span>
                            </div>
                          )}
                          {task.locationId && (
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <span className="ml-2 font-medium">{task.locationId}</span>
                            </div>
                          )}
                          {task.scheduledStartTime && (
                            <div>
                              <span className="text-gray-500">Scheduled Start:</span>
                              <span className="ml-2 font-medium">{formatDateTime(task.scheduledStartTime)}</span>
                            </div>
                          )}
                          {task.expectedCompletionTime && (
                            <div>
                              <span className="text-gray-500">Expected Completion:</span>
                              <span className="ml-2 font-medium">{formatDateTime(task.expectedCompletionTime)}</span>
                            </div>
                          )}
                          {task.actualStartTime && (
                            <div>
                              <span className="text-gray-500">Actual Start:</span>
                              <span className="ml-2 font-medium">{formatDateTime(task.actualStartTime)}</span>
                            </div>
                          )}
                          {task.actualCompletionTime && (
                            <div>
                              <span className="text-gray-500">Actual Completion:</span>
                              <span className="ml-2 font-medium">{formatDateTime(task.actualCompletionTime)}</span>
                            </div>
                          )}
                          {task.durationMinutes !== undefined && (
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <span className="ml-2 font-medium">{task.durationMinutes} minutes</span>
                            </div>
                          )}
                          {task.isOverdue && (
                            <div className="col-span-2">
                              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                                OVERDUE
                              </span>
                            </div>
                          )}
                        </div>

                        {task.instructions && (
                          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                            <div className="text-gray-700 font-medium mb-1">Instructions:</div>
                            <div className="text-gray-900">{task.instructions}</div>
                          </div>
                        )}

                        {task.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <span className="text-gray-500 font-medium">Notes: </span>
                            {task.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cancel Movement</h3>
            <label className="block text-sm font-medium mb-2">Cancellation Reason *</label>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for cancellation..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Movement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold Dialog */}
      {showHoldDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Put Movement on Hold</h3>
            <label className="block text-sm font-medium mb-2">Hold Reason *</label>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for holding..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowHoldDialog(false);
                  setHoldReason('');
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handleHoldSubmit}
                disabled={!holdReason.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Put on Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
