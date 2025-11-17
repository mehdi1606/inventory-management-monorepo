// src/pages/movements/MovementLinesPage.tsx

import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Package, TrendingUp, AlertTriangle, Filter } from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { MovementLine } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MovementLineDetailModal } from '@/components/movement-lines/MovementLineDetailModal';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export const MovementLinesPage = () => {
  const [lines, setLines] = useState<MovementLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<MovementLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMovement, setFilterMovement] = useState('');

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<MovementLine | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    totalLines: 0,
    completedLines: 0,
    pendingLines: 0,
    linesWithVariance: 0,
    totalQuantityRequested: 0,
    totalQuantityPicked: 0,
  });

  // Fetch lines
  const fetchLines = async () => {
    setLoading(true);
    try {
      const data = await movementService.getMovementLines();
      const linesArray = Array.isArray(data) ? data : [];
      setLines(linesArray);
      setFilteredLines(linesArray);
      calculateStats(linesArray);
    } catch (error) {
      toast.error('Failed to fetch movement lines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  // Calculate statistics
  const calculateStats = (linesData: MovementLine[]) => {
    const totalLines = linesData.length;
    const completedLines = linesData.filter(l => l.status === 'COMPLETED').length;
    const pendingLines = linesData.filter(l => l.status === 'PENDING').length;
    const linesWithVariance = linesData.filter(l => {
      const variance = (l.actualQuantity || 0) - l.requestedQuantity;
      return variance !== 0;
    }).length;
    
    const totalQuantityRequested = linesData.reduce((sum, l) => sum + l.requestedQuantity, 0);
    const totalQuantityPicked = linesData.reduce((sum, l) => sum + (l.actualQuantity || 0), 0);

    setStats({
      totalLines,
      completedLines,
      pendingLines,
      linesWithVariance,
      totalQuantityRequested,
      totalQuantityPicked,
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = lines;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (line) =>
          line.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          line.movement?.movementNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          line.lotId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          line.serialId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((line) => line.status === filterStatus);
    }

    // Movement filter
    if (filterMovement) {
      filtered = filtered.filter((line) => line.movementId === filterMovement);
    }

    setFilteredLines(filtered);
  }, [searchTerm, filterStatus, filterMovement, lines]);

  // Handlers
  const handleView = (line: MovementLine) => {
    setSelectedLine(line);
    setIsDetailModalOpen(true);
  };

  const handleComplete = async (line: MovementLine) => {
    try {
      await movementService.completeMovementLine(line.id);
      toast.success('Line completed successfully');
      fetchLines();
    } catch (error) {
      toast.error('Failed to complete line');
      console.error(error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Movement Lines
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track individual movement line items across all movements
              </p>
            </div>
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
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Lines</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalLines}
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
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.completedLines}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.totalLines > 0 ? Math.round((stats.completedLines / stats.totalLines) * 100) : 0}% completion rate
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
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {stats.pendingLines}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">With Variance</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {stats.linesWithVariance}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-neutral-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search & Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by item, movement, lot, serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
            <Select
              value={filterMovement}
              onChange={(e) => setFilterMovement(e.target.value)}
            >
              <option value="">All Movements</option>
              {/* This would be populated with actual movements */}
            </Select>
          </div>
        </motion.div>

        {/* Lines Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-neutral-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Movement Lines ({filteredLines.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-gray-50 dark:bg-neutral-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Line #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Movement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Variance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lot/Serial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                  {filteredLines.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No movement lines found</p>
                        <p className="text-sm mt-2">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLines.map((line) => {
                      const variance = (line.actualQuantity || 0) - line.requestedQuantity;
                      return (
                        <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{line.lineNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {line.movement?.movementNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {line.itemId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {line.requestedQuantity} {line.uom || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {line.actualQuantity !== undefined ? `${line.actualQuantity} ${line.uom || ''}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {line.actualQuantity !== undefined ? (
                              <span className={`font-medium ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {variance > 0 ? '+' : ''}{variance}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {line.lotId && <div className="text-xs">Lot: {line.lotId}</div>}
                            {line.serialId && <div className="text-xs">Serial: {line.serialId}</div>}
                            {!line.lotId && !line.serialId && '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(line.status)}`}>
                              {line.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleView(line)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              {line.status !== 'COMPLETED' && line.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleComplete(line)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Complete Line"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Modals */}
        <MovementLineDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          line={selectedLine}
        />
      </div>
    </div>
  );
};