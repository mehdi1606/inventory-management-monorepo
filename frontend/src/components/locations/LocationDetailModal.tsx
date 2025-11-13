// src/components/locations/LocationDetailModal.tsx
import React from 'react';

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Location Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-lg font-semibold">{data.name || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Warehouse</label>
            <p className="mt-1">{data.warehouse_name || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Aisle</label>
              <p className="mt-1">{data.aisle || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Rack</label>
              <p className="mt-1">{data.rack || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Shelf</label>
              <p className="mt-1">{data.shelf || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Bin</label>
              <p className="mt-1">{data.bin || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Capacity</label>
              <p className="mt-1">{data.capacity || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">{data.status || 'N/A'}</p>
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