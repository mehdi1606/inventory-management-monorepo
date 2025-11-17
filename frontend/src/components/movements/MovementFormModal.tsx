// src/components/movements/MovementFormModal.tsx

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { movementService } from '@/services/movement.service';
import {
  Movement,
  MovementRequestDto,
  MovementLineRequestDto,
  MovementTaskRequestDto,
  MovementType,
  MovementPriority,
  MovementStatus,
  LineStatus,
  TaskType,
  TaskStatus,
} from '@/types';
import { toast } from 'react-hot-toast';

interface MovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Movement | null;
}

export const MovementFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: MovementFormModalProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'lines' | 'tasks'>('details');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [lines, setLines] = useState<MovementLineRequestDto[]>([]);
  const [tasks, setTasks] = useState<MovementTaskRequestDto[]>([]);

  const [formData, setFormData] = useState<Partial<MovementRequestDto>>({
    type: MovementType.TRANSFER,
    warehouseId: '',
    priority: MovementPriority.NORMAL,
    lines: [],
    tasks: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchWarehouses();
      fetchLocations();
      fetchItems();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        warehouseId: initialData.warehouseId,
        priority: initialData.priority,
        movementDate: initialData.movementDate,
        expectedDate: initialData.expectedDate,
        scheduledDate: initialData.scheduledDate,
        sourceLocationId: initialData.sourceLocationId,
        destinationLocationId: initialData.destinationLocationId,
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

  const fetchWarehouses = async () => {
    try {
      const response = await locationService.getWarehouses();
      setWarehouses(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      setLocations(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      setItems(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lines.length === 0) {
      toast.error('Please add at least one movement line');
      return;
    }

    const submitData: MovementRequestDto = {
      ...formData,
      lines,
      tasks: tasks.length > 0 ? tasks : undefined
    } as MovementRequestDto;

    try {
      if (initialData) {
        await movementService.updateMovement(initialData.id, submitData);
        toast.success('Movement updated successfully');
      } else {
        await movementService.createMovement(submitData);
        toast.success('Movement created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(initialData ? 'Failed to update movement' : 'Failed to create movement');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-neutral-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {initialData ? 'Edit Movement' : 'Create Movement'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {initialData ? 'Update movement details, lines and tasks' : 'Add a new stock movement'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-800'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'lines'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-800'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('lines')}
          >
            Lines ({lines.length})
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-800'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks ({tasks.length})
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-neutral-800">
          <form id="movement-form" onSubmit={handleSubmit}>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Movement Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Movement Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
                      required
                    >
                      <option value={MovementType.TRANSFER}>Transfer</option>
                      <option value={MovementType.RECEIPT}>Receipt</option>
                      <option value={MovementType.ISSUE}>Issue</option>
                      <option value={MovementType.ADJUSTMENT}>Adjustment</option>
                      <option value={MovementType.PICKING}>Picking</option>
                      <option value={MovementType.PUTAWAY}>Putaway</option>
                      <option value={MovementType.RETURN}>Return</option>
                      <option value={MovementType.CYCLE_COUNT}>Cycle Count</option>
                    </select>
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Warehouse <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.warehouseId}
                      onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Priority</label>
                    <select
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as MovementPriority })}
                    >
                      <option value={MovementPriority.LOW}>Low</option>
                      <option value={MovementPriority.NORMAL}>Normal</option>
                      <option value={MovementPriority.HIGH}>High</option>
                      <option value={MovementPriority.URGENT}>Urgent</option>
                      <option value={MovementPriority.CRITICAL}>Critical</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                    <select
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.status || MovementStatus.DRAFT}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as MovementStatus })}
                    >
                      <option value={MovementStatus.DRAFT}>Draft</option>
                      <option value={MovementStatus.PENDING}>Pending</option>
                      <option value={MovementStatus.IN_PROGRESS}>In Progress</option>
                    </select>
                  </div>

                  {/* Source Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Source Location</label>
                    <select
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.sourceLocationId || ''}
                      onChange={(e) => setFormData({ ...formData, sourceLocationId: e.target.value })}
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Destination Location</label>
                    <select
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.destinationLocationId || ''}
                      onChange={(e) => setFormData({ ...formData, destinationLocationId: e.target.value })}
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Movement Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Movement Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.movementDate ? new Date(formData.movementDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, movementDate: e.target.value })}
                    />
                  </div>

                  {/* Expected Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Expected Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.expectedDate ? new Date(formData.expectedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    />
                  </div>

                  {/* Scheduled Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Scheduled Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reference Number</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      value={formData.referenceNumber || ''}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      placeholder="Enter reference number"
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors resize-none"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Add any notes..."
                    maxLength={5000}
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for movement"
                    maxLength={500}
                  />
                </div>
              </div>
            )}

            {/* Lines Tab */}
            {activeTab === 'lines' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Movement Lines</h3>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    Add Line
                  </button>
                </div>

                {lines.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-dashed border-gray-300 dark:border-neutral-700">
                    <p className="text-lg font-medium">No lines added yet</p>
                    <p className="text-sm mt-2">Click "Add Line" to add movement lines</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lines.map((line, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-900">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Line #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Item */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Item <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                              value={line.itemId}
                              onChange={(e) => updateLine(index, 'itemId', e.target.value)}
                              required
                            >
                              <option value="">Select Item</option>
                              {items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Requested Quantity */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Requested Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                              value={line.requestedQuantity}
                              onChange={(e) => updateLine(index, 'requestedQuantity', Number(e.target.value))}
                              min={1}
                              required
                            />
                          </div>

                          {/* UOM */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Unit of Measure</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                              value={line.uom || ''}
                              onChange={(e) => updateLine(index, 'uom', e.target.value)}
                              placeholder="e.g., EA, KG, L"
                            />
                          </div>

                          {/* From Location */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">From Location</label>
                            <select
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                              value={line.fromLocationId || ''}
                              onChange={(e) => updateLine(index, 'fromLocationId', e.target.value)}
                            >
                              <option value="">Select Location</option>
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* To Location */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">To Location</label>
                            <select
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                              value={line.toLocationId || ''}
                              onChange={(e) => updateLine(index, 'toLocationId', e.target.value)}
                            >
                              <option value="">Select Location</option>
                              {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Notes */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Notes</label>
                            <textarea
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors resize-none"
                              value={line.notes || ''}
                              onChange={(e) => updateLine(index, 'notes', e.target.value)}
                              rows={2}
                              placeholder="Add line notes..."
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Movement Tasks</h3>
                  <button
                    type="button"
                    onClick={addTask}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-dashed border-gray-300 dark:border-neutral-700">
                    <p className="text-lg font-medium">No tasks added yet</p>
                    <p className="text-sm mt-2">Click "Add Task" to add movement tasks</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-900">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Task #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeTask(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Task Type */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Task Type</label>
                            <select
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                              value={task.taskType}
                              onChange={(e) => updateTask(index, 'taskType', e.target.value as TaskType)}
                            >
                              <option value={TaskType.PICK}>Pick</option>
                              <option value={TaskType.PACK}>Pack</option>
                              <option value={TaskType.PUT_AWAY}>Put Away</option>
                              <option value={TaskType.COUNT}>Count</option>
                              <option value={TaskType.INSPECT}>Inspect</option>
                            </select>
                          </div>

                          {/* Priority */}
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Priority (1-10)</label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                              value={task.priority || 5}
                              onChange={(e) => updateTask(index, 'priority', Number(e.target.value))}
                              min={1}
                              max={10}
                            />
                          </div>

                          {/* Instructions */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Instructions</label>
                            <textarea
                              className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors resize-none"
                              value={task.instructions || ''}
                              onChange={(e) => updateTask(index, 'instructions', e.target.value)}
                              rows={2}
                              placeholder="Add task instructions..."
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="movement-form"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg transition-all"
            >
              {initialData ? 'Update Movement' : 'Create Movement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};