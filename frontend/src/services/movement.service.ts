// frontend/src/services/movement.service.ts

import { apiClient } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config/constants';
import { Movement, MovementLine, MovementTask, PaginatedResponse, PaginationParams, ApiResponse } from '@/types';
import { storage } from '@/utils/storage';

export const movementService = {
  // Movements
  getMovements: async (params?: PaginationParams): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(API_ENDPOINTS.MOVEMENTS.MOVEMENTS, { params });
    return response.data;
  },

  getMovementById: async (id: string): Promise<Movement> => {
    const response = await apiClient.get<Movement>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id));
    return response.data;
  },

  createMovement: async (data: Partial<Movement>): Promise<ApiResponse<Movement>> => {
    // ✅ FIX: Get user ID from storage and send in header
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    console.log('🚀 Creating movement with user ID:', userId);
    console.log('📦 Movement data:', data);
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.post<ApiResponse<Movement>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENTS, 
      data,
      { headers }
    );
    return response.data;
  },

  updateMovement: async (id: string, data: Partial<Movement>): Promise<ApiResponse<Movement>> => {
    // ✅ Also add user ID to update
    const user = storage.get<any>(STORAGE_KEYS.USER);
    const userId = user?.id || user?.userId;
    
    const headers: any = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await apiClient.put<ApiResponse<Movement>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id), 
      data,
      { headers }
    );
    return response.data;
  },

  deleteMovement: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id));
    return response.data;
  },

  startMovement: async (id: string): Promise<ApiResponse<Movement>> => {
    const response = await apiClient.post<ApiResponse<Movement>>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/start`);
    return response.data;
  },

  completeMovement: async (id: string): Promise<ApiResponse<Movement>> => {
    const response = await apiClient.post<ApiResponse<Movement>>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/complete`);
    return response.data;
  },

  cancelMovement: async (id: string, reason?: string): Promise<ApiResponse<Movement>> => {
    const response = await apiClient.post<ApiResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/cancel`,
      { reason }
    );
    return response.data;
  },

  // Movement Lines
  getMovementLines: async (): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINES);
    return response.data || [];
  },

  getMovementLinesByMovement: async (movementId: string): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINES}/movement/${movementId}`);
    return response.data || [];
  },

  getMovementLineById: async (id: string): Promise<MovementLine> => {
    const response = await apiClient.get<MovementLine>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id));
    return response.data;
  },

  createMovementLine: async (data: Partial<MovementLine>): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.post<ApiResponse<MovementLine>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINES, data);
    return response.data;
  },

  updateMovementLine: async (id: string, data: Partial<MovementLine>): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.put<ApiResponse<MovementLine>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id), data);
    return response.data;
  },

  deleteMovementLine: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id));
    return response.data;
  },

  completeMovementLine: async (id: string): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.post<ApiResponse<MovementLine>>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id)}/complete`);
    return response.data;
  },

  updateActualQuantity: async (id: string, actualQuantity: number): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.patch<ApiResponse<MovementLine>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_LINE_BY_ID(id)}/actual-quantity`,
      null,
      { params: { actualQuantity } }
    );
    return response.data;
  },

  // Movement Tasks
  getMovementTasks: async (): Promise<MovementTask[]> => {
    try {
      const response = await apiClient.get<MovementTask[]>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS}/unassigned`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching movement tasks:', error);
      return [];
    }
  },

  getMovementTasksByMovement: async (movementId: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS}/movement/${movementId}`);
    return response.data || [];
  },

  getMovementTasksByStatus: async (status: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS}/status/${status}`);
    return response.data || [];
  },

  getMovementTasksByAssignedUser: async (userId: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS}/assigned-to/${userId}`);
    return response.data || [];
  },

  getUnassignedTasks: async (): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS}/unassigned`);
    return response.data || [];
  },

  getMovementTaskById: async (id: string): Promise<MovementTask> => {
    const response = await apiClient.get<MovementTask>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id));
    return response.data;
  },

  createMovementTask: async (data: Partial<MovementTask>): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.post<ApiResponse<MovementTask>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASKS, data);
    return response.data;
  },

  updateMovementTask: async (id: string, data: Partial<MovementTask>): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.put<ApiResponse<MovementTask>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id), data);
    return response.data;
  },

  deleteMovementTask: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id));
    return response.data;
  },

  assignMovementTask: async (id: string, data: { assignedUserId: string; notes?: string }): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id)}/assign`,
      null,
      { params: { assignToUserId: data.assignedUserId } }
    );
    return response.data;
  },

  startMovementTask: async (id: string): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.post<ApiResponse<MovementTask>>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id)}/start`);
    return response.data;
  },

  completeMovementTask: async (id: string): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.post<ApiResponse<MovementTask>>(`${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id)}/complete`);
    return response.data;
  },

  cancelMovementTask: async (id: string, reason?: string): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_TASK_BY_ID(id)}/cancel`,
      { reason }
    );
    return response.data;
  },
};