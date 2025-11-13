// src/components/movements/MovementDetailModal.tsx
import React from 'react';

interface MovementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Movement Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Movement Type</label>
              <p className="mt-1 text-lg font-semibold capitalize">{data.movement_type || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Quantity</label>
              <p className="mt-1 text-lg">{data.quantity || 0}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Item Variant</label>
            <p className="mt-1">{data.item_variant_name || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">From Location</label>
              <p className="mt-1">{data.from_location_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">To Location</label>
              <p className="mt-1">{data.to_location_name || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Reference Number</label>
              <p className="mt-1">{data.reference_number || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">{data.status || 'N/A'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Notes</label>
            <p className="mt-1">{data.notes || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Movement Date</label>
              <p className="mt-1">{data.movement_date ? new Date(data.movement_date).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Created By</label>
              <p className="mt-1">{data.created_by_name || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="mt-1">{data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Updated At</label>
              <p className="mt-1">{data.updated_at ? new Date(data.updated_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};