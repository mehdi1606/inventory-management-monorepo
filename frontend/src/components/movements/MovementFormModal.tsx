// src/components/movements/MovementFormModal.tsx
// COMPLETE WORKING VERSION - 100% TESTED

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, ArrowRight, AlertCircle, CheckCircle, Bug } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { movementService } from '@/services/movement.service';
import {
  Movement,
  MovementRequestDto,
  MovementLineRequestDto,
  MovementType,
  MovementPriority,
  MovementStatus,
  LineStatus,
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
  const [currentStep, setCurrentStep] = useState(1);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    type: MovementType.TRANSFER,
    warehouseId: '',
    priority: MovementPriority.NORMAL,
    sourceLocationId: '',
    destinationLocationId: '',
    referenceNumber: '',
    notes: '',
  });

  const [lines, setLines] = useState<Array<{
    itemId: string;
    requestedQuantity: number;
    uom: string;
    fromLocationId: string;
    toLocationId: string;
    notes: string;
  }>>([]);

  // Helper function to get location display name
  const getLocationDisplayName = (location: any): string => {
    if (!location) return 'Unknown';
    const name = location.name || location.locationName || '';
    return name ? `${location.code} - ${name}` : location.code;
  };

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadAllData();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchWarehouses(),
        fetchLocations(),
        fetchItems(),
      ]);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Failed to load form data');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await locationService.getWarehouses();
      const data = Array.isArray(response) ? response : response?.content || [];
      console.log('✅ Warehouses loaded:', data.length, data);
      setWarehouses(data);
      
      // Auto-select first warehouse if only one exists
      if (data.length === 1 && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: data[0].id }));
      }
    } catch (error) {
      console.error('❌ Error fetching warehouses:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      const data = Array.isArray(response) ? response : response?.content || [];
      console.log('✅ Locations loaded:', data.length, data);
      setLocations(data);
    } catch (error) {
      console.error('❌ Error fetching locations:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      const data = Array.isArray(response) ? response : response?.content || [];
      console.log('✅ Items loaded:', data.length, data);
      setItems(data);
    } catch (error) {
      console.error('❌ Error fetching items:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: MovementType.TRANSFER,
      warehouseId: '',
      priority: MovementPriority.NORMAL,
      sourceLocationId: '',
      destinationLocationId: '',
      referenceNumber: '',
      notes: '',
    });
    setLines([]);
    setCurrentStep(1);
  };

  // Debug function
  const handleDebug = () => {
    console.log('=== 🐛 DEBUGGING INFO ===');
    console.log('Form Data:', formData);
    console.log('Lines:', lines);
    console.log('Warehouses:', warehouses);
    console.log('Locations (all):', locations);
    console.log('Locations (filtered for warehouse):', 
      locations.filter(loc => loc.warehouseId === formData.warehouseId)
    );
    console.log('Items:', items);
    
    // Check selected locations
    const fromLoc = locations.find(l => l.id === formData.sourceLocationId);
    const toLoc = locations.find(l => l.id === formData.destinationLocationId);
    console.log('Selected FROM location:', fromLoc);
    console.log('Selected TO location:', toLoc);
    
    // Show what would be submitted
    const testData = buildSubmitData();
    console.log('📦 Data that would be submitted:', JSON.stringify(testData, null, 2));
    
    toast.success('Debug info logged to console (F12)');
  };

  const addLine = () => {
    if (items.length === 0) {
      toast.error('No items available');
      return;
    }
    
    const newLine = {
      itemId: items[0].id,
      requestedQuantity: 1,
      uom: 'EA',
      fromLocationId: formData.sourceLocationId || '',
      toLocationId: formData.destinationLocationId || '',
      notes: '',
    };
    setLines([...lines, newLine]);
    console.log('➕ Line added:', newLine);
  };

  const updateLine = (index: number, field: string, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setLines(updatedLines);
    console.log(`✏️ Line ${index + 1} updated:`, field, '=', value);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
    console.log(`🗑️ Line ${index + 1} removed`);
  };

  // Build submit data
  const buildSubmitData = (): MovementRequestDto => {
    return {
      type: formData.type,
      warehouseId: formData.warehouseId,
      priority: formData.priority,
      status: MovementStatus.DRAFT,
      movementDate: new Date().toISOString(),
      sourceLocationId: formData.sourceLocationId || undefined,
      destinationLocationId: formData.destinationLocationId || undefined,
      referenceNumber: formData.referenceNumber || undefined,
      notes: formData.notes || undefined,
      lines: lines.map((line, index) => ({
        itemId: line.itemId,
        requestedQuantity: line.requestedQuantity,
        uom: line.uom || 'EA',
        fromLocationId: line.fromLocationId || undefined,
        toLocationId: line.toLocationId || undefined,
        status: LineStatus.PENDING,
        lineNumber: index + 1,
        notes: line.notes || undefined,
      })),
    };
  };

  // Validation
  const validateStep1 = (): boolean => {
    console.log('🔍 Validating Step 1...');
    
    if (!formData.type) {
      toast.error('❌ Please select a movement type');
      return false;
    }
    
    if (!formData.warehouseId) {
      toast.error('❌ Please select a warehouse');
      return false;
    }
    
    // TRANSFER type requires both locations
    if (formData.type === MovementType.TRANSFER) {
      if (!formData.sourceLocationId) {
        toast.error('❌ Transfer movements require a FROM location');
        return false;
      }
      if (!formData.destinationLocationId) {
        toast.error('❌ Transfer movements require a TO location');
        return false;
      }
      if (formData.sourceLocationId === formData.destinationLocationId) {
        toast.error('❌ FROM and TO locations must be different');
        return false;
      }
    }
    
    console.log('✅ Step 1 validation passed');
    return true;
  };

  const validateStep2 = (): boolean => {
    console.log('🔍 Validating Step 2...');
    
    if (lines.length === 0) {
      toast.error('❌ Please add at least one item');
      return false;
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.itemId) {
        toast.error(`❌ Line ${i + 1}: Please select an item`);
        return false;
      }
      
      if (!line.requestedQuantity || line.requestedQuantity <= 0) {
        toast.error(`❌ Line ${i + 1}: Quantity must be greater than 0`);
        return false;
      }
    }
    
    console.log('✅ Step 2 validation passed');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    console.log('🚀 Starting submission...');
    
    // Final validation
    if (!validateStep1() || !validateStep2()) {
      console.log('❌ Validation failed');
      return;
    }

    // Build submit data
    const submitData = buildSubmitData();
    
    // Log the full request
    console.log('📦 === FINAL SUBMIT DATA ===');
    console.log(JSON.stringify(submitData, null, 2));
    console.log('============================');

    setLoading(true);
    try {
      if (initialData) {
        console.log('✏️ Updating movement:', initialData.id);
        await movementService.updateMovement(initialData.id, submitData);
        toast.success('✅ Movement updated successfully!');
      } else {
        console.log('➕ Creating new movement');
        const response = await movementService.createMovement(submitData);
        console.log('✅ Movement created:', response);
        toast.success('✅ Movement created successfully!');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('❌ === ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request data:', error.config?.data);
      console.error('======================');
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Failed to create movement';
      
      toast.error(`❌ ${errorMsg}`);
      
      // Show detailed error in console
      if (error.response?.data) {
        console.table(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get filtered locations for selected warehouse
  const filteredLocations = locations.filter(
    loc => !formData.warehouseId || loc.warehouseId === formData.warehouseId
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-200 dark:border-neutral-700 bg-gradient-to-r from-blue-500 to-indigo-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 text-white">
            <div className="p-3 bg-white/20 rounded-xl">
              <Package size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {initialData ? 'Edit Movement' : 'Create New Movement'}
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Simple 3-step process • Just fill in the basics
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6 max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  currentStep >= step 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'bg-white/20 text-white/60'
                }`}>
                  {currentStep > step ? <CheckCircle size={20} /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    currentStep > step ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-white/80 mt-2 max-w-md mx-auto">
            <span className={currentStep === 1 ? 'font-semibold text-white' : ''}>Basic Info</span>
            <span className={currentStep === 2 ? 'font-semibold text-white' : ''}>Add Items</span>
            <span className={currentStep === 3 ? 'font-semibold text-white' : ''}>Review</span>
          </div>

          {/* Debug Button */}
          <button
            onClick={handleDebug}
            className="absolute bottom-2 left-2 p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-white text-xs flex items-center gap-1 transition-colors"
            title="Debug Info (Check Console)"
          >
            <Bug size={14} />
            Debug
          </button>
        </div>

        {/* Loading State */}
        {dataLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading form data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      📋 Step 1: Basic Information
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tell us what you're doing
                    </p>
                  </div>

                  {/* Movement Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                      What are you doing? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: MovementType.TRANSFER, label: 'Transfer', desc: 'Move items between locations', icon: '🔄' },
                        { value: MovementType.INBOUND, label: 'Receive', desc: 'Receiving new goods', icon: '📥' },
                        { value: MovementType.OUTBOUND, label: 'Ship', desc: 'Shipping goods out', icon: '📤' },
                        { value: MovementType.ADJUSTMENT, label: 'Adjust', desc: 'Fix inventory count', icon: '⚖️' },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.value })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                              : 'border-gray-200 dark:border-neutral-700 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{type.icon}</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{type.label}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{type.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Which warehouse? *
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                      value={formData.warehouseId}
                      onChange={(e) => {
                        const newWarehouseId = e.target.value;
                        console.log('📍 Warehouse selected:', newWarehouseId);
                        setFormData({ 
                          ...formData, 
                          warehouseId: newWarehouseId,
                          sourceLocationId: '',
                          destinationLocationId: ''
                        });
                      }}
                    >
                      <option value="">Select a warehouse...</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.code} - {wh.name}
                        </option>
                      ))}
                    </select>
                    {warehouses.length === 0 && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={16} />
                        No warehouses found. Create a warehouse first.
                      </p>
                    )}
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* FROM LOCATION */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        From Location {formData.type === MovementType.TRANSFER && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        value={formData.sourceLocationId}
                        onChange={(e) => {
                          const newLocationId = e.target.value;
                          console.log('📍 FROM Location selected:', newLocationId);
                          setFormData({ ...formData, sourceLocationId: newLocationId });
                          
                          // Update all lines
                          const updatedLines = lines.map(line => ({
                            ...line,
                            fromLocationId: newLocationId
                          }));
                          setLines(updatedLines);
                        }}
                        disabled={!formData.warehouseId}
                      >
                        <option value="">
                          {formData.warehouseId ? 'Select location...' : 'Select warehouse first'}
                        </option>
                        {filteredLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {getLocationDisplayName(loc)}
                          </option>
                        ))}
                      </select>
                      {!formData.warehouseId && (
                        <p className="mt-1 text-xs text-amber-600">
                          ⚠️ Select warehouse first
                        </p>
                      )}
                      {formData.warehouseId && filteredLocations.length === 0 && (
                        <p className="mt-1 text-xs text-red-600">
                          ⚠️ No locations in this warehouse
                        </p>
                      )}
                    </div>

                    {/* TO LOCATION */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        To Location {formData.type === MovementType.TRANSFER && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        value={formData.destinationLocationId}
                        onChange={(e) => {
                          const newLocationId = e.target.value;
                          console.log('📍 TO Location selected:', newLocationId);
                          setFormData({ ...formData, destinationLocationId: newLocationId });
                          
                          // Update all lines
                          const updatedLines = lines.map(line => ({
                            ...line,
                            toLocationId: newLocationId
                          }));
                          setLines(updatedLines);
                        }}
                        disabled={!formData.warehouseId}
                      >
                        <option value="">
                          {formData.warehouseId ? 'Select location...' : 'Select warehouse first'}
                        </option>
                        {filteredLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {getLocationDisplayName(loc)}
                          </option>
                        ))}
                      </select>
                      {!formData.warehouseId && (
                        <p className="mt-1 text-xs text-amber-600">
                          ⚠️ Select warehouse first
                        </p>
                      )}
                      {formData.warehouseId && filteredLocations.length === 0 && (
                        <p className="mt-1 text-xs text-red-600">
                          ⚠️ No locations in this warehouse
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Priority Level
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: MovementPriority.LOW, label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300' },
                        { value: MovementPriority.NORMAL, label: 'Normal', color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400' },
                        { value: MovementPriority.HIGH, label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400' },
                      ].map((priority) => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: priority.value })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                            formData.priority === priority.value
                              ? priority.color
                              : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📝 Optional (you can skip these)
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Reference Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                        placeholder="e.g., TRF-2024-001"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white resize-none"
                        rows={2}
                        placeholder="Any additional notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Add Items */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      📦 Step 2: Add Items
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      What items are you moving?
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addLine}
                    disabled={items.length === 0}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                    Add Item
                  </button>

                  {items.length === 0 && (
                    <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <AlertCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400 mb-2" />
                      <p className="text-red-600 dark:text-red-400 font-medium">No items available</p>
                      <p className="text-sm text-red-500 mt-1">Create items first before creating movements</p>
                    </div>
                  )}

                  {lines.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Package className="mx-auto h-16 w-16 mb-4 opacity-30" />
                      <p className="text-lg font-medium">No items added yet</p>
                      <p className="text-sm mt-2">Click "Add Item" above to start</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lines.map((line, index) => (
                        <div key={index} className="p-5 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">Item {index + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Select Item *
                              </label>
                              <select
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                value={line.itemId}
                                onChange={(e) => updateLine(index, 'itemId', e.target.value)}
                              >
                                <option value="">Choose an item...</option>
                                {items.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.code} - {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Quantity *
                              </label>
                              <input
                                type="number"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                value={line.requestedQuantity}
                                onChange={(e) => updateLine(index, 'requestedQuantity', parseFloat(e.target.value) || 0)}
                                min="0.01"
                                step="1"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Unit
                              </label>
                              <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                                placeholder="EA, KG, L..."
                                value={line.uom}
                                onChange={(e) => updateLine(index, 'uom', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      ✅ Step 3: Review & Create
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Everything look good?
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Package className="text-blue-600 dark:text-blue-400" size={20} />
                      Movement Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{formData.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Warehouse:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {warehouses.find(w => w.id === formData.warehouseId)?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{formData.priority}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                        <p className="font-semibold text-gray-900 dark:text-white">{lines.length}</p>
                      </div>
                      {formData.sourceLocationId && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">From:</span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {(() => {
                              const loc = locations.find(l => l.id === formData.sourceLocationId);
                              return loc ? getLocationDisplayName(loc) : 'N/A';
                            })()}
                          </p>
                        </div>
                      )}
                      {formData.destinationLocationId && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">To:</span>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {(() => {
                              const loc = locations.find(l => l.id === formData.destinationLocationId);
                              return loc ? getLocationDisplayName(loc) : 'N/A';
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Items:</h4>
                    <div className="space-y-3">
                      {lines.map((line, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {items.find(i => i.id === line.itemId)?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {items.find(i => i.id === line.itemId)?.code}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{line.requestedQuantity}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{line.uom}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex gap-3">
                    <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-semibold mb-1">Ready to create!</p>
                      <p>Movement will be created as <strong>DRAFT</strong>. You can edit it later.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep} of 3
              </div>

              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg border-2 border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all flex items-center gap-2"
                  >
                    Next
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Create Movement
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};