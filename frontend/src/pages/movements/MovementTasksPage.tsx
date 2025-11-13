// src/pages/movements/MovementTasksPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, UserCheck, CheckCircle, ClipboardList } from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { MovementTask } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MovementTaskDetailModal } from '@/components/movement-tasks/MovementTaskDetailModal';
import { AssignTaskModal } from '@/components/movement-tasks/AssignTaskModal';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const MovementTasksPage = () => {
  const [tasks, setTasks] = useState<MovementTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<MovementTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MovementTask | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await movementService.getMovementTasks();
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      toast.error('Failed to fetch movement tasks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.movement?.movementNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter((task) => task.taskType === filterType);
    }

    // Assigned filter
    if (filterAssigned === 'assigned') {
      filtered = filtered.filter((task) => task.assignedTo);
    } else if (filterAssigned === 'unassigned') {
      filtered = filtered.filter((task) => !task.assignedTo);
    }

    setFilteredTasks(filtered);
  }, [searchTerm, filterStatus, filterType, filterAssigned, tasks]);

  // Handlers
  const handleView = (task: MovementTask) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleAssign = (task: MovementTask) => {
    setSelectedTask(task);
    setIsAssignModalOpen(true);
  };

  const handleComplete = async (task: MovementTask) => {
    try {
      await movementService.completeMovementTask(task.id);
      toast.success('Task completed successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to complete task');
      console.error(error);
    }
  };

  const handleAssignSuccess = () => {
    fetchTasks();
    setIsAssignModalOpen(false);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movement Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and assign movement tasks</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search tasks..."
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
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full"
          >
            <option value="">All Types</option>
            <option value="PICKING">Picking</option>
            <option value="PACKING">Packing</option>
            <option value="LOADING">Loading</option>
            <option value="UNLOADING">Unloading</option>
            <option value="PUTAWAY">Putaway</option>
            <option value="COUNTING">Counting</option>
          </Select>
          <Select
            value={filterAssigned}
            onChange={(e) => setFilterAssigned(e.target.value)}
            className="w-full"
          >
            <option value="">All Tasks</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <ClipboardList className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tasks.filter((t) => t.status === 'PENDING').length}
              </p>
            </div>
            <ClipboardList className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <UserCheck className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter((t) => t.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-orange-600">
                {tasks.filter((t) => !t.assignedTo && t.status !== 'COMPLETED').length}
              </p>
            </div>
            <ClipboardList className="text-orange-500" size={32} />
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
                    Task #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
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
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{task.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.movement?.movementNumber || task.movementId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {task.taskType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.assignedTo || (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(task)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          {!task.assignedTo && task.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleAssign(task)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Assign"
                            >
                              <UserCheck size={18} />
                            </button>
                          )}
                          {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleComplete(task)}
                              className="text-green-600 hover:text-green-900"
                              title="Complete"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
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
      <MovementTaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTask}
      />

      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
        task={selectedTask}
      />
    </div>
  );
};