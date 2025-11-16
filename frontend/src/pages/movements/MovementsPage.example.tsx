// src/pages/movements/MovementsPage.example.tsx
// This is an example showing how to use the Movement components with data fetching

import React, { useState, useEffect } from 'react';
import { MovementFormModal } from '@/components/movements/MovementFormModal';
import { MovementDetailModal } from '@/components/movements/MovementDetailModal';
import { useMovementFormData } from '@/hooks/useMovementFormData';
import { movementService } from '@/services/movement.service';
import { Movement, MovementRequestDto } from '@/types';

export const MovementsPageExample: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch dropdown data for forms (warehouses, locations, items, users)
  const {
    warehouses,
    locations,
    items,
    users,
    loading: dataLoading,
    error: dataError
  } = useMovementFormData();

  // Fetch movements list
  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await movementService.getMovements({ page: 0, size: 20 });
      setMovements(response.content);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Handle create new movement
  const handleCreateMovement = async (data: MovementRequestDto) => {
    try {
      const response = await movementService.createMovement(data);
      console.log('Movement created:', response);
      await fetchMovements(); // Refresh list
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error creating movement:', error);
      alert('Failed to create movement');
    }
  };

  // Handle update movement
  const handleUpdateMovement = async (data: MovementRequestDto) => {
    if (!editingMovement) return;

    try {
      const response = await movementService.updateMovement(editingMovement.id, data);
      console.log('Movement updated:', response);
      await fetchMovements(); // Refresh list
      setIsFormModalOpen(false);
      setEditingMovement(null);
    } catch (error) {
      console.error('Error updating movement:', error);
      alert('Failed to update movement');
    }
  };

  // Handle delete movement
  const handleDeleteMovement = async (movementId: string) => {
    try {
      await movementService.deleteMovement(movementId);
      await fetchMovements(); // Refresh list
      setIsDetailModalOpen(false);
      setSelectedMovement(null);
    } catch (error) {
      console.error('Error deleting movement:', error);
      alert('Failed to delete movement');
    }
  };

  // Handle start movement
  const handleStartMovement = async (movementId: string) => {
    try {
      const response = await movementService.startMovement(movementId);
      console.log('Movement started:', response);
      await fetchMovements();
      // Refresh detail view
      if (selectedMovement?.id === movementId) {
        setSelectedMovement(response);
      }
    } catch (error) {
      console.error('Error starting movement:', error);
      alert('Failed to start movement');
    }
  };

  // Handle complete movement
  const handleCompleteMovement = async (movementId: string) => {
    try {
      const response = await movementService.completeMovement(movementId);
      console.log('Movement completed:', response);
      await fetchMovements();
      if (selectedMovement?.id === movementId) {
        setSelectedMovement(response);
      }
    } catch (error) {
      console.error('Error completing movement:', error);
      alert('Failed to complete movement');
    }
  };

  // Handle cancel movement
  const handleCancelMovement = async (movementId: string, reason: string) => {
    try {
      const response = await movementService.cancelMovement(movementId, reason);
      console.log('Movement cancelled:', response);
      await fetchMovements();
      if (selectedMovement?.id === movementId) {
        setSelectedMovement(response);
      }
    } catch (error) {
      console.error('Error cancelling movement:', error);
      alert('Failed to cancel movement');
    }
  };

  // Handle hold movement
  const handleHoldMovement = async (movementId: string, reason: string) => {
    try {
      const response = await movementService.holdMovement(movementId, reason);
      console.log('Movement put on hold:', response);
      await fetchMovements();
      if (selectedMovement?.id === movementId) {
        setSelectedMovement(response);
      }
    } catch (error) {
      console.error('Error holding movement:', error);
      alert('Failed to put movement on hold');
    }
  };

  // Handle release movement
  const handleReleaseMovement = async (movementId: string) => {
    try {
      const response = await movementService.releaseMovement(movementId);
      console.log('Movement released from hold:', response);
      await fetchMovements();
      if (selectedMovement?.id === movementId) {
        setSelectedMovement(response);
      }
    } catch (error) {
      console.error('Error releasing movement:', error);
      alert('Failed to release movement');
    }
  };

  // Handle edit from detail modal
  const handleEditMovement = (movement: Movement) => {
    setEditingMovement(movement);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  // Handle view details
  const handleViewDetails = async (movementId: string) => {
    try {
      const movement = await movementService.getMovementById(movementId);
      setSelectedMovement(movement);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching movement details:', error);
      alert('Failed to load movement details');
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Error: {dataError}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Movements</h1>
        <button
          onClick={() => {
            setEditingMovement(null);
            setIsFormModalOpen(true);
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Movement
        </button>
      </div>

      {/* Movements List */}
      {loading ? (
        <div className="text-center py-12">Loading movements...</div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No movements found. Click "Create Movement" to add one.
        </div>
      ) : (
        <div className="grid gap-4">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
              onClick={() => handleViewDetails(movement.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {movement.referenceNumber || movement.id}
                  </h3>
                  <p className="text-gray-600">
                    Type: {movement.type} • Status: {movement.status}
                  </p>
                  <p className="text-sm text-gray-500">
                    Lines: {movement.totalLines || movement.lines?.length || 0} •
                    Tasks: {movement.tasks?.length || 0}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  movement.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  movement.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  movement.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {movement.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <MovementFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMovement(null);
        }}
        onSubmit={editingMovement ? handleUpdateMovement : handleCreateMovement}
        initialData={editingMovement || undefined}
        warehouses={warehouses}
        locations={locations}
        items={items}
        users={users}
      />

      {/* Detail Modal */}
      <MovementDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMovement(null);
        }}
        data={selectedMovement}
        onEdit={handleEditMovement}
        onDelete={handleDeleteMovement}
        onStart={handleStartMovement}
        onComplete={handleCompleteMovement}
        onCancel={handleCancelMovement}
        onHold={handleHoldMovement}
        onRelease={handleReleaseMovement}
      />
    </div>
  );
};
