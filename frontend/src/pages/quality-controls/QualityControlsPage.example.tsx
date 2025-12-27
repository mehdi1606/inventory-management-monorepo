// src/pages/quality-controls/QualityControlsPage.example.tsx
// This is an example showing how to use Quality Control components with status changes

import React, { useState, useEffect } from 'react';
import { QualityControlDetailModal } from '@/components/quality-controls/QualityControlDetailModal';
import { qualityService } from '@/services/quality.service';
import { QualityControl, QCStatus } from '@/types';

export const QualityControlsPageExample: React.FC = () => {
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [selectedQC, setSelectedQC] = useState<QualityControl | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch quality controls list
  const fetchQualityControls = async () => {
    setLoading(true);
    try {
      const response = await qualityService.getQualityControls({ page: 0, size: 20 });
      setQualityControls(response.content);
    } catch (error) {
      console.error('Error fetching quality controls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityControls();
  }, []);

  // Handle view details - fetch fresh data
  const handleViewDetails = async (qcId: string) => {
    try {
      const qc = await qualityService.getQualityControlById(qcId);
      setSelectedQC(qc);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching quality control details:', error);
      alert('Failed to load quality control details');
    }
  };

  // Handle status change
  const handleStatusChange = async (id: string, status: QCStatus) => {
    try {
      // Call API to update status
      const updatedQC = await qualityService.updateQualityControlStatus(id, status);
      console.log('Status updated:', updatedQC);

      // Refresh the detail view with updated data
      setSelectedQC(updatedQC);

      // Refresh the list
      await fetchQualityControls();

      alert(`Status successfully changed to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      const updatedQC = await qualityService.approveQualityControl(id);
      console.log('Quality control approved:', updatedQC);

      // Refresh the detail view with updated data
      setSelectedQC(updatedQC);

      // Refresh the list
      await fetchQualityControls();

      alert('Quality control approved successfully');
    } catch (error) {
      console.error('Error approving quality control:', error);
      alert('Failed to approve quality control');
    }
  };

  // Handle reject
  const handleReject = async (id: string, reason: string) => {
    try {
      const updatedQC = await qualityService.rejectQualityControl(id, reason);
      console.log('Quality control rejected:', updatedQC);

      // Refresh the detail view with updated data
      setSelectedQC(updatedQC);

      // Refresh the list
      await fetchQualityControls();

      alert('Quality control rejected');
    } catch (error) {
      console.error('Error rejecting quality control:', error);
      alert('Failed to reject quality control');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await qualityService.deleteQualityControl(id);
      await fetchQualityControls();
      setIsDetailModalOpen(false);
      setSelectedQC(null);
      alert('Quality control deleted successfully');
    } catch (error) {
      console.error('Error deleting quality control:', error);
      alert('Failed to delete quality control');
    }
  };

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quality Controls</h1>
        <button
          onClick={fetchQualityControls}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Quality Controls List */}
      {loading ? (
        <div className="text-center py-12">Loading quality controls...</div>
      ) : qualityControls.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No quality controls found.
        </div>
      ) : (
        <div className="grid gap-4">
          {qualityControls.map((qc) => (
            <div
              key={qc.id}
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
              onClick={() => handleViewDetails(qc.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {qc.inspectionNumber}
                  </h3>
                  <p className="text-gray-600">
                    Type: {qc.inspectionType} • Item: {qc.itemId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Quantity: {qc.quantityInspected}
                    {qc.defectCount !== undefined && ` • Defects: ${qc.defectCount}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(qc.status)}`}>
                    {qc.status}
                  </span>
                  {qc.approvedBy && (
                    <span className="text-xs text-green-600">✓ Approved</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <QualityControlDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedQC(null);
        }}
        data={selectedQC}
        onStatusChange={handleStatusChange}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    </div>
  );
};
