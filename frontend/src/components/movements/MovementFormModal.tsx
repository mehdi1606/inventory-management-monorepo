// src/components/movements/MovementFormModal.tsx
import React, { useState, useEffect } from 'react';
import {
  MovementRequestDto,
  MovementLineRequestDto,
  MovementTaskRequestDto,
  MovementType,
  MovementStatus,
  MovementPriority,
  LineStatus,
  TaskType,
  TaskStatus,
  Movement
} from '@/types';

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovementRequestDto) => void;
  initialData?: Movement;
  warehouses?: Array<{ id: string; name: string }>;
  locations?: Array<{ id: string; name: string }>;
  items?: Array<{ id: string; name: string; sku: string }>;
  users?: Array<{ id: string; username: string }>;
}

export const MovementFormModal: React.FC<MovementFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  warehouses = [],
  locations = [],
  items = [],
  users = []
}) => {
  const [formData, setFormData] = useState<MovementRequestDto>({
    type: MovementType.TRANSFER,
    warehouseId: '',
    priority: MovementPriority.NORMAL,
    lines: [],
    tasks: []
  });

  const [lines, setLines] = useState<MovementLineRequestDto[]>([]);
  const [tasks, setTasks] = useState<MovementTaskRequestDto[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'lines' | 'tasks'>('details');

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        warehouseId: initialData.warehouseId,
        priority: initialData.priority,
        status: initialData.status,
        movementDate: initialData.movementDate,
        expectedDate: initialData.expectedDate,
        scheduledDate: initialData.scheduledDate,
        sourceLocationId: initialData.sourceLocationId,
        destinationLocationId: initialData.destinationLocationId,
        sourceUserId: initialData.sourceUserId,
        destinationUserId: initialData.destinationUserId,
        referenceNumber: initialData.referenceNumber,
        notes: initialData.notes,
        reason: initialData.reason,
        lines: initialData.lines.map(line => ({
          itemId: line.itemId,
          requestedQuantity: line.requestedQuantity,
          actualQuantity: line.actualQuantity,
          uom: line.uom,
          lotId: line.lotId,
          serialId: line.serialId,
          fromLocationId: line.fromLocationId,
          toLocationId: line.toLocationId,
          status: line.status,
          lineNumber: line.lineNumber,
          notes: line.notes,
          reason: line.reason
        })),
        tasks: initialData.tasks?.map(task => ({
          movementLineId: task.movementLineId,
          assignedUserId: task.assignedUserId,
          taskType: task.taskType,
          status: task.status,
          priority: task.priority,
          scheduledStartTime: task.scheduledStartTime,
          expectedCompletionTime: task.expectedCompletionTime,
          locationId: task.locationId,
          instructions: task.instructions,
          notes: task.notes
        }))
      });
      setLines(initialData.lines.map(line => ({
        itemId: line.itemId,
        requestedQuantity: line.requestedQuantity,
        actualQuantity: line.actualQuantity,
        uom: line.uom,
        lotId: line.lotId,
        serialId: line.serialId,
        fromLocationId: line.fromLocationId,
        toLocationId: line.toLocationId,
        status: line.status,
        lineNumber: line.lineNumber,
        notes: line.notes,
        reason: line.reason
      })));
      setTasks(initialData.tasks?.map(task => ({
        movementLineId: task.movementLineId,
        assignedUserId: task.assignedUserId,
        taskType: task.taskType,
        status: task.status,
        priority: task.priority,
        scheduledStartTime: task.scheduledStartTime,
        expectedCompletionTime: task.expectedCompletionTime,
        locationId: task.locationId,
        instructions: task.instructions,
        notes: task.notes
      })) || []);
    } else {
      // Reset for create mode
      setFormData({
        type: MovementType.TRANSFER,
        warehouseId: warehouses[0]?.id || '',
        priority: MovementPriority.NORMAL,
        lines: [],
        tasks: []
      });
      setLines([]);
      setTasks([]);
    }
  }, [initialData, warehouses]);

  const addLine = () => {
    const newLine: MovementLineRequestDto = {
      itemId: items[0]?.id || '',
      requestedQuantity: 1,
      lineNumber: lines.length + 1,
      status: LineStatus.PENDING
    };
    setLines([...lines, newLine]);
  };

  const updateLine = (index: number, field: keyof MovementLineRequestDto, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setLines(updatedLines);
  };

  const removeLine = (index: number) => {
    const updatedLines = lines.filter((_, i) => i !== index);
    // Re-number lines
    updatedLines.forEach((line, i) => {
      line.lineNumber = i + 1;
    });
    setLines(updatedLines);
  };

  const addTask = () => {
    const newTask: MovementTaskRequestDto = {
      taskType: TaskType.PICK,
      status: TaskStatus.PENDING,
      priority: 5
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (index: number, field: keyof MovementTaskRequestDto, value: any) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (lines.length === 0) {
      alert('Please add at least one movement line');
      return;
    }

    const submitData: MovementRequestDto = {
      ...formData,
      lines,
      tasks: tasks.length > 0 ? tasks : undefined
    };

    onSubmit(submitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {initialData ? 'Edit Movement' : 'Create Movement'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex border-b mb-6">
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
              Lines {lines.length > 0 && `(${lines.length})`}
            </button>
            <button
              className={`px-6 py-3 font-medium ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks {tasks.length > 0 && `(${tasks.length})`}
            </button>
          </div>

          <form id="movement-form" onSubmit={handleSubmit}>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Movement Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as MovementType })
                      }
                      required
                    >
                      {Object.values(MovementType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.warehouseId}
                      onChange={(e) =>
                        setFormData({ ...formData, warehouseId: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as MovementPriority })
                      }
                    >
                      {Object.values(MovementPriority).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.status || MovementStatus.DRAFT}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as MovementStatus })
                      }
                    >
                      {Object.values(MovementStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Source Location</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.sourceLocationId || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, sourceLocationId: e.target.value })
                      }
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Destination Location</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.destinationLocationId || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationLocationId: e.target.value })
                      }
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Movement Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-3 py-2"
                      value={formData.movementDate || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, movementDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-3 py-2"
                      value={formData.expectedDate || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Scheduled Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-3 py-2"
                      value={formData.scheduledDate || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reference Number</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={formData.referenceNumber || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, referenceNumber: e.target.value })
                      }
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    maxLength={5000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    maxLength={500}
                  />
                </div>
              </div>
            )}

            {/* Lines Tab */}
            {activeTab === 'lines' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Movement Lines</h3>
                  <button
                    type="button"
                    onClick={addLine}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    + Add Line
                  </button>
                </div>

                {lines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lines added. Click "Add Line" to add movement lines.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lines.map((line, index) => (
                      <div key={index} className="border rounded p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold">Line #{line.lineNumber}</h4>
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Item <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={line.itemId}
                              onChange={(e) => updateLine(index, 'itemId', e.target.value)}
                              required
                            >
                              <option value="">Select Item</option>
                              {items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.sku})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Requested Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              className="w-full border rounded px-3 py-2"
                              value={line.requestedQuantity}
                              onChange={(e) =>
                                updateLine(index, 'requestedQuantity', parseFloat(e.target.value))
                              }
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Actual Quantity</label>
                            <input
                              type="number"
                              className="w-full border rounded px-3 py-2"
                              value={line.actualQuantity || ''}
                              onChange={(e) =>
                                updateLine(index, 'actualQuantity', parseFloat(e.target.value))
                              }
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">UOM</label>
                            <input
                              type="text"
                              className="w-full border rounded px-3 py-2"
                              value={line.uom || ''}
                              onChange={(e) => updateLine(index, 'uom', e.target.value)}
                              maxLength={20}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">From Location</label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={line.fromLocationId || ''}
                              onChange={(e) => updateLine(index, 'fromLocationId', e.target.value)}
                            >
                              <option value="">Select Location</option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">To Location</label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={line.toLocationId || ''}
                              onChange={(e) => updateLine(index, 'toLocationId', e.target.value)}
                            >
                              <option value="">Select Location</option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={line.status || LineStatus.PENDING}
                              onChange={(e) =>
                                updateLine(index, 'status', e.target.value as LineStatus)
                              }
                            >
                              {Object.values(LineStatus).map((status) => (
                                <option key={status} value={status}>
                                  {status.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <textarea
                              className="w-full border rounded px-3 py-2"
                              value={line.notes || ''}
                              onChange={(e) => updateLine(index, 'notes', e.target.value)}
                              rows={2}
                              maxLength={5000}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Movement Tasks (Optional)</h3>
                  <button
                    type="button"
                    onClick={addTask}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    + Add Task
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks added. Tasks are optional.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task, index) => (
                      <div key={index} className="border rounded p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold">Task #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeTask(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Task Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={task.taskType}
                              onChange={(e) =>
                                updateTask(index, 'taskType', e.target.value as TaskType)
                              }
                              required
                            >
                              {Object.values(TaskType).map((type) => (
                                <option key={type} value={type}>
                                  {type.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Priority (1-10)</label>
                            <input
                              type="number"
                              className="w-full border rounded px-3 py-2"
                              value={task.priority || 5}
                              onChange={(e) =>
                                updateTask(index, 'priority', parseInt(e.target.value))
                              }
                              min="1"
                              max="10"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Assigned To</label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={task.assignedUserId || ''}
                              onChange={(e) => updateTask(index, 'assignedUserId', e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.username}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <select
                              className="w-full border rounded px-3 py-2"
                              value={task.locationId || ''}
                              onChange={(e) => updateTask(index, 'locationId', e.target.value)}
                            >
                              <option value="">Select Location</option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Scheduled Start</label>
                            <input
                              type="datetime-local"
                              className="w-full border rounded px-3 py-2"
                              value={task.scheduledStartTime || ''}
                              onChange={(e) =>
                                updateTask(index, 'scheduledStartTime', e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Expected Completion</label>
                            <input
                              type="datetime-local"
                              className="w-full border rounded px-3 py-2"
                              value={task.expectedCompletionTime || ''}
                              onChange={(e) =>
                                updateTask(index, 'expectedCompletionTime', e.target.value)
                              }
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Instructions</label>
                            <textarea
                              className="w-full border rounded px-3 py-2"
                              value={task.instructions || ''}
                              onChange={(e) => updateTask(index, 'instructions', e.target.value)}
                              rows={2}
                              maxLength={5000}
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <textarea
                              className="w-full border rounded px-3 py-2"
                              value={task.notes || ''}
                              onChange={(e) => updateTask(index, 'notes', e.target.value)}
                              rows={2}
                              maxLength={5000}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="movement-form"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {initialData ? 'Update Movement' : 'Create Movement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};