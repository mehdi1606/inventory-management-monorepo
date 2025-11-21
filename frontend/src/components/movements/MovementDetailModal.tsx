import React, { useState, useEffect } from 'react';
import {
  X, Edit, Save, Plus, Trash2, PlayCircle, CheckCircle, XCircle,
  Pause, AlertCircle, Package, ClipboardList, Users, Calendar,
  MapPin, FileText, Clock, TrendingUp, Building2, Box, Hash
} from 'lucide-react';
import { movementService } from '../../services/movement.service';
import { locationService } from '../../services/location.service';
import { productService } from '../../services/product.service';
import { Movement, MovementLine, MovementTask, MovementStatus, MovementType, MovementPriority } from '../../types';
import MovementLineForm from './MovementLineForm';
import MovementTaskCard from './MovementTaskCard';
import { toast } from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';

interface MovementDetailModalProps {
  movement: Movement;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onStatusChange: (movementId: string, action: string, reason?: string) => void;
  onDelete: (movementId: string) => void;
}

type TabType = 'details' | 'lines' | 'tasks';

// ============================================
// ENRICHED DATA TYPES
// ============================================
interface EnrichedData {
  sourceLocationName: string;
  destinationLocationName: string;
  warehouseName: string;
  items: Map<string, { name: string; sku: string; description?: string }>;
  locations: Map<string, { code: string; zone?: string; aisle?: string }>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatDate = (date: string | Date | null | undefined, formatStr: string = 'PPp'): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'N/A';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'N/A';
  }
};

const toDateTimeLocal = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error converting date to datetime-local:', date, error);
    return '';
  }
};

const truncateId = (id: string | undefined): string => {
  if (!id) return 'N/A';
  return `${id.slice(0, 8)}...`;
};

const MovementDetailModal: React.FC<MovementDetailModalProps> = ({
  movement: initialMovement,
  isOpen,
  onClose,
  onUpdate,
  onStatusChange,
  onDelete
}) => {
  const [movement, setMovement] = useState<Movement>(initialMovement);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedData>({
    sourceLocationName: 'Loading...',
    destinationLocationName: 'Loading...',
    warehouseName: 'Loading...',
    items: new Map(),
    locations: new Map()
  });
  const [lines, setLines] = useState<MovementLine[]>([]);
  const [tasks, setTasks] = useState<MovementTask[]>([]);
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editedMovement, setEditedMovement] = useState({
    type: movement.type,
    priority: movement.priority,
    expectedDate: movement.expectedDate || '',
    scheduledDate: movement.scheduledDate || '',
    sourceLocationId: movement.sourceLocationId || '',
    destinationLocationId: movement.destinationLocationId || '',
    warehouseId: movement.warehouseId,
    notes: movement.notes || ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchMovementDetails();
      fetchLines();
      fetchTasks();
      enrichMovementData();
    }
  }, [isOpen, movement.id]);

  // ============================================
  // DATA ENRICHMENT - Fetch Real Names
  // ============================================
  const enrichMovementData = async () => {
    const newEnrichedData: EnrichedData = {
      sourceLocationName: 'N/A',
      destinationLocationName: 'N/A',
      warehouseName: 'N/A',
      items: new Map(),
      locations: new Map()
    };

    try {
      // Fetch warehouse name
      if (movement.warehouseId) {
        try {
          const warehouse = await locationService.getWarehouseById(movement.warehouseId);
          newEnrichedData.warehouseName = warehouse.name || warehouse.code || truncateId(movement.warehouseId);
        } catch (error) {
          console.error('Error fetching warehouse:', error);
          newEnrichedData.warehouseName = truncateId(movement.warehouseId);
        }
      }

      // Fetch source location name
      if (movement.sourceLocationId) {
        try {
          const location = await locationService.getLocationById(movement.sourceLocationId);
          newEnrichedData.sourceLocationName = location.code || truncateId(movement.sourceLocationId);
          newEnrichedData.locations.set(movement.sourceLocationId, {
            code: location.code,
            zone: location.zone,
            aisle: location.aisle
          });
        } catch (error) {
          console.error('Error fetching source location:', error);
          newEnrichedData.sourceLocationName = truncateId(movement.sourceLocationId);
        }
      }

      // Fetch destination location name
      if (movement.destinationLocationId) {
        try {
          const location = await locationService.getLocationById(movement.destinationLocationId);
          newEnrichedData.destinationLocationName = location.code || truncateId(movement.destinationLocationId);
          newEnrichedData.locations.set(movement.destinationLocationId, {
            code: location.code,
            zone: location.zone,
            aisle: location.aisle
          });
        } catch (error) {
          console.error('Error fetching destination location:', error);
          newEnrichedData.destinationLocationName = truncateId(movement.destinationLocationId);
        }
      }

      setEnrichedData(newEnrichedData);
    } catch (error) {
      console.error('Error enriching movement data:', error);
    }
  };

  const enrichLineData = async (lines: MovementLine[]) => {
    const newItemsMap = new Map(enrichedData.items);
    const newLocationsMap = new Map(enrichedData.locations);

    for (const line of lines) {
      // Fetch item details
      if (line.itemId && !newItemsMap.has(line.itemId)) {
        try {
          const item = await productService.getItemById(line.itemId);
          newItemsMap.set(line.itemId, {
            name: item.name,
            sku: item.sku,
            description: item.description
          });
        } catch (error) {
          console.error('Error fetching item:', error);
          newItemsMap.set(line.itemId, {
            name: truncateId(line.itemId),
            sku: 'N/A',
            description: undefined
          });
        }
      }

      // Fetch from location
      if (line.fromLocationId && !newLocationsMap.has(line.fromLocationId)) {
        try {
          const location = await locationService.getLocationById(line.fromLocationId);
          newLocationsMap.set(line.fromLocationId, {
            code: location.code,
            zone: location.zone,
            aisle: location.aisle
          });
        } catch (error) {
          console.error('Error fetching from location:', error);
          newLocationsMap.set(line.fromLocationId, {
            code: truncateId(line.fromLocationId)
          });
        }
      }

      // Fetch to location
      if (line.toLocationId && !newLocationsMap.has(line.toLocationId)) {
        try {
          const location = await locationService.getLocationById(line.toLocationId);
          newLocationsMap.set(line.toLocationId, {
            code: location.code,
            zone: location.zone,
            aisle: location.aisle
          });
        } catch (error) {
          console.error('Error fetching to location:', error);
          newLocationsMap.set(line.toLocationId, {
            code: truncateId(line.toLocationId)
          });
        }
      }
    }

    setEnrichedData(prev => ({
      ...prev,
      items: newItemsMap,
      locations: newLocationsMap
    }));
  };

  const enrichTaskData = async (tasks: MovementTask[]) => {
    const newLocationsMap = new Map(enrichedData.locations);

    for (const task of tasks) {
      if (task.locationId && !newLocationsMap.has(task.locationId)) {
        try {
          const location = await locationService.getLocationById(task.locationId);
          newLocationsMap.set(task.locationId, {
            code: location.code,
            zone: location.zone,
            aisle: location.aisle
          });
        } catch (error) {
          console.error('Error fetching task location:', error);
          newLocationsMap.set(task.locationId, {
            code: truncateId(task.locationId)
          });
        }
      }
    }

    setEnrichedData(prev => ({
      ...prev,
      locations: newLocationsMap
    }));
  };

  const fetchMovementDetails = async () => {
    try {
      const response = await movementService.getMovementById(movement.id);
      setMovement(response);
    } catch (error: any) {
      console.error('Error fetching movement details:', error);
      toast.error('Failed to fetch movement details');
    }
  };

  const fetchLines = async () => {
    try {
      const linesData = await movementService.getLinesByMovement(movement.id);
      setLines(linesData);
      await enrichLineData(linesData);
    } catch (error: any) {
      console.error('Error fetching movement lines:', error);
      toast.error('Failed to fetch movement lines');
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksData = await movementService.getTasksByMovement(movement.id);
      setTasks(tasksData);
      await enrichTaskData(tasksData);
    } catch (error: any) {
      console.error('Error fetching movement tasks:', error);
      toast.error('Failed to fetch movement tasks');
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updateData = {
        ...editedMovement,
        expectedDate: editedMovement.expectedDate ? new Date(editedMovement.expectedDate).toISOString() : null,
        scheduledDate: editedMovement.scheduledDate ? new Date(editedMovement.scheduledDate).toISOString() : null,
      };
      
      await movementService.updateMovement(movement.id, updateData);
      toast.success('Movement updated successfully');
      setIsEditing(false);
      fetchMovementDetails();
      onUpdate();
    } catch (error: any) {
      console.error('Error updating movement:', error);
      toast.error(error.message || 'Failed to update movement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = async (lineData: any) => {
    try {
      setLoading(true);
      await movementService.addLineToMovement(movement.id, lineData);
      toast.success('Line added successfully');
      setIsAddingLine(false);
      fetchLines();
    } catch (error: any) {
      console.error('Error adding line:', error);
      toast.error(error.message || 'Failed to add line');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    if (!window.confirm('Are you sure you want to delete this line?')) return;
    
    try {
      setLoading(true);
      await movementService.deleteMovementLine(lineId);
      toast.success('Line deleted successfully');
      fetchLines();
    } catch (error: any) {
      console.error('Error deleting line:', error);
      toast.error(error.message || 'Failed to delete line');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setLoading(true);
      await movementService.deleteMovementTask(taskId);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MovementStatus) => {
    switch (status) {
      case MovementStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case MovementStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case MovementStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case MovementStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case MovementStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case MovementStatus.ON_HOLD:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: MovementType) => {
    switch (type) {
      case MovementType.INBOUND:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case MovementType.OUTBOUND:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case MovementType.TRANSFER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case MovementType.ADJUSTMENT:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case MovementType.RETURN:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: MovementPriority) => {
    switch (priority) {
      case MovementPriority.LOW:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case MovementPriority.NORMAL:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case MovementPriority.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case MovementPriority.URGENT:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const canEdit = () => {
    return [MovementStatus.DRAFT, MovementStatus.PENDING].includes(movement.status);
  };

  const canDelete = () => {
    return [MovementStatus.DRAFT, MovementStatus.CANCELLED].includes(movement.status);
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (movement.status === MovementStatus.PENDING) {
      actions.push({ label: 'Start', action: 'start', icon: PlayCircle, color: 'blue' });
    }
    
    if (movement.status === MovementStatus.IN_PROGRESS) {
      actions.push({ label: 'Complete', action: 'complete', icon: CheckCircle, color: 'green' });
      actions.push({ label: 'Hold', action: 'hold', icon: Pause, color: 'orange', requiresReason: true });
    }
    
    if (movement.status === MovementStatus.ON_HOLD) {
      actions.push({ label: 'Release', action: 'release', icon: PlayCircle, color: 'blue' });
    }
    
    if ([MovementStatus.PENDING, MovementStatus.IN_PROGRESS, MovementStatus.ON_HOLD].includes(movement.status)) {
      actions.push({ label: 'Cancel', action: 'cancel', icon: XCircle, color: 'red', requiresReason: true });
    }
    
    return actions;
  };

  const handleAction = (action: string, requiresReason: boolean) => {
    if (requiresReason) {
      const reason = window.prompt(`Please provide a reason for ${action}:`);
      if (reason) {
        onStatusChange(movement.id, action, reason);
      }
    } else {
      onStatusChange(movement.id, action);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Package className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {movement.referenceNumber || `Movement #${movement.id.slice(0, 8)}`}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                      {movement.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(movement.type)}`}>
                      {movement.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(movement.priority)}`}>
                      {movement.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Action Buttons */}
                {getAvailableActions().map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.action}
                      onClick={() => handleAction(action.action, action.requiresReason || false)}
                      className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
                      style={{
                        backgroundColor: action.color === 'blue' ? '#2563eb' : 
                                       action.color === 'green' ? '#16a34a' : 
                                       action.color === 'orange' ? '#ea580c' :
                                       action.color === 'red' ? '#dc2626' : '#6b7280'
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </button>
                  );
                })}

                {/* Delete Button */}
                {canDelete() && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this movement?')) {
                        onDelete(movement.id);
                        onClose();
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Details
              </button>
              <button
                onClick={() => setActiveTab('lines')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'lines'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-2" />
                Lines ({lines.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Tasks ({tasks.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Movement Information</h3>
                  {canEdit() && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  )}
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Enhanced Grid with Icons and Better Styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Package className="w-4 h-4 mr-2" />
                      Type
                    </label>
                    {isEditing ? (
                      <select
                        value={editedMovement.type}
                        onChange={(e) => setEditedMovement({ ...editedMovement, type: e.target.value as MovementType })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {Object.values(MovementType).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{movement.type}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Priority
                    </label>
                    {isEditing ? (
                      <select
                        value={editedMovement.priority}
                        onChange={(e) => setEditedMovement({ ...editedMovement, priority: e.target.value as MovementPriority })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {Object.values(MovementPriority).map((priority) => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{movement.priority}</p>
                    )}
                  </div>

                  {/* Warehouse - Enhanced Display */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <label className="flex items-center text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                      <Building2 className="w-4 h-4 mr-2" />
                      Warehouse
                    </label>
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-bold">
                      {enrichedData.warehouseName}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 flex items-center">
                      <Hash className="w-3 h-3 mr-1" />
                      {truncateId(movement.warehouseId)}
                    </p>
                  </div>

                  {/* Movement Date */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      Movement Date
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(movement.movementDate)}
                    </p>
                  </div>

                  {/* Source Location - Enhanced Display */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <label className="flex items-center text-sm font-medium text-green-900 dark:text-green-200 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      Source Location
                    </label>
                    <p className="text-sm text-green-900 dark:text-green-100 font-bold">
                      {enrichedData.sourceLocationName}
                    </p>
                    {movement.sourceLocationId && enrichedData.locations.get(movement.sourceLocationId) && (
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {enrichedData.locations.get(movement.sourceLocationId)?.zone && 
                          `Zone ${enrichedData.locations.get(movement.sourceLocationId)?.zone} • `}
                        {enrichedData.locations.get(movement.sourceLocationId)?.aisle && 
                          `Aisle ${enrichedData.locations.get(movement.sourceLocationId)?.aisle}`}
                      </p>
                    )}
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1 flex items-center">
                      <Hash className="w-3 h-3 mr-1" />
                      {truncateId(movement.sourceLocationId)}
                    </p>
                  </div>

                  {/* Destination Location - Enhanced Display */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <label className="flex items-center text-sm font-medium text-purple-900 dark:text-purple-200 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      Destination Location
                    </label>
                    <p className="text-sm text-purple-900 dark:text-purple-100 font-bold">
                      {enrichedData.destinationLocationName}
                    </p>
                    {movement.destinationLocationId && enrichedData.locations.get(movement.destinationLocationId) && (
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        {enrichedData.locations.get(movement.destinationLocationId)?.zone && 
                          `Zone ${enrichedData.locations.get(movement.destinationLocationId)?.zone} • `}
                        {enrichedData.locations.get(movement.destinationLocationId)?.aisle && 
                          `Aisle ${enrichedData.locations.get(movement.destinationLocationId)?.aisle}`}
                      </p>
                    )}
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 flex items-center">
                      <Hash className="w-3 h-3 mr-1" />
                      {truncateId(movement.destinationLocationId)}
                    </p>
                  </div>

                  {/* Expected Date */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      Expected Date
                    </label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={toDateTimeLocal(editedMovement.expectedDate)}
                        onChange={(e) => setEditedMovement({ ...editedMovement, expectedDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(movement.expectedDate)}
                      </p>
                    )}
                  </div>

                  {/* Scheduled Date */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      Scheduled Date
                    </label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={toDateTimeLocal(editedMovement.scheduledDate)}
                        onChange={(e) => setEditedMovement({ ...editedMovement, scheduledDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(movement.scheduledDate)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedMovement.notes}
                      onChange={(e) => setEditedMovement({ ...editedMovement, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter notes..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{movement.notes || 'No notes'}</p>
                  )}
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(movement.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Updated At
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(movement.updatedAt)}
                    </p>
                  </div>
                  {movement.completedAt && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Completed At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(movement.completedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lines Tab - Enhanced with Item Names */}
            {activeTab === 'lines' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Movement Lines</h3>
                  {canEdit() && (
                    <button
                      onClick={() => setIsAddingLine(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Line
                    </button>
                  )}
                </div>

                {isAddingLine && (
                  <MovementLineForm
                    movementId={movement.id}
                    onSubmit={handleAddLine}
                    onCancel={() => setIsAddingLine(false)}
                  />
                )}

                {lines.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No lines</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by adding a movement line.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lines.map((line) => {
                      const itemData = enrichedData.items.get(line.itemId);
                      const fromLoc = line.fromLocationId ? enrichedData.locations.get(line.fromLocationId) : null;
                      const toLoc = line.toLocationId ? enrichedData.locations.get(line.toLocationId) : null;
                      
                      return (
                        <div
                          key={line.id}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-3">
                              {/* Item Info - Enhanced */}
                              <div className="flex items-start space-x-3">
                                <Box className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {itemData?.name || 'Loading...'}
                                  </p>
                                  {itemData?.sku && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      SKU: {itemData.sku}
                                    </p>
                                  )}
                                  {itemData?.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {itemData.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                                    <Hash className="w-3 h-3 mr-1" />
                                    {truncateId(line.itemId)}
                                  </p>
                                </div>
                              </div>

                              {/* Locations and Quantity Grid */}
                              <div className="grid grid-cols-3 gap-4 pl-8">
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">From Location</span>
                                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    {fromLoc?.code || truncateId(line.fromLocationId) || 'N/A'}
                                  </p>
                                  {fromLoc && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {fromLoc.zone && `Z${fromLoc.zone}`}
                                      {fromLoc.aisle && ` • A${fromLoc.aisle}`}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">To Location</span>
                                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                    {toLoc?.code || truncateId(line.toLocationId) || 'N/A'}
                                  </p>
                                  {toLoc && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {toLoc.zone && `Z${toLoc.zone}`}
                                      {toLoc.aisle && ` • A${toLoc.aisle}`}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Requested Qty</span>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {line.requestedQuantity} {line.uom || 'units'}
                                  </p>
                                </div>
                              </div>

                              {line.notes && (
                                <div className="pl-8">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">{line.notes}</p>
                                </div>
                              )}
                            </div>
                            {canEdit() && (
                              <button
                                onClick={() => handleDeleteLine(line.id)}
                                className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tasks Tab - Enhanced with Location Names */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Movement Tasks</h3>
                  {canEdit() && (
                    <button
                      onClick={() => setIsAddingTask(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </button>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by adding a movement task.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => {
                      const taskLoc = task.locationId ? enrichedData.locations.get(task.locationId) : null;
                      
                      return (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {task.taskType}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status as any)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              {task.locationId && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {taskLoc?.code || truncateId(task.locationId)}
                                  </span>
                                  {taskLoc && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {taskLoc.zone && `Zone ${taskLoc.zone}`}
                                      {taskLoc.aisle && ` • Aisle ${taskLoc.aisle}`}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {task.instructions && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{task.instructions}</p>
                              )}
                            </div>
                            {canEdit() && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementDetailModal;