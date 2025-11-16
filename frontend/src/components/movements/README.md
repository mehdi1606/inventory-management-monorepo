# Movement Components Documentation

This directory contains the Movement form and detail components for managing stock movements in the inventory system.

## Components

### 1. MovementFormModal
A comprehensive tabbed form for creating and editing movements with lines and tasks.

### 2. MovementDetailModal
A professional tabbed display for viewing movement details with action buttons.

## Quick Start

### Step 1: Use the Custom Hook for Data Fetching

```tsx
import { useMovementFormData } from '@/hooks/useMovementFormData';

const { warehouses, locations, items, users, loading, error } = useMovementFormData();
```

This hook automatically fetches:
- **Warehouses** - All warehouses from location service
- **Locations** - All locations from location service
- **Items** - All items from product service
- **Users** - Mock users (replace with real user service when available)

### Step 2: Create a Movement

```tsx
import { MovementFormModal } from '@/components/movements/MovementFormModal';
import { movementService } from '@/services/movement.service';

const [isOpen, setIsOpen] = useState(false);

const handleCreate = async (data: MovementRequestDto) => {
  try {
    const response = await movementService.createMovement(data);
    console.log('Created:', response);
    // Refresh your movements list
  } catch (error) {
    console.error('Error:', error);
  }
};

<MovementFormModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={handleCreate}
  warehouses={warehouses}
  locations={locations}
  items={items}
  users={users}
/>
```

### Step 3: Edit a Movement

```tsx
const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

const handleUpdate = async (data: MovementRequestDto) => {
  try {
    const response = await movementService.updateMovement(selectedMovement.id, data);
    console.log('Updated:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};

<MovementFormModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={handleUpdate}
  initialData={selectedMovement}  // Pre-fills the form
  warehouses={warehouses}
  locations={locations}
  items={items}
  users={users}
/>
```

### Step 4: View Movement Details

```tsx
import { MovementDetailModal } from '@/components/movements/MovementDetailModal';

<MovementDetailModal
  isOpen={isDetailOpen}
  onClose={() => setIsDetailOpen(false)}
  data={selectedMovement}
  onEdit={(movement) => {
    // Switch to edit mode
    setSelectedMovement(movement);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  }}
  onDelete={async (id) => {
    await movementService.deleteMovement(id);
    // Refresh list
  }}
  onStart={async (id) => {
    await movementService.startMovement(id);
    // Refresh detail view
  }}
  onComplete={async (id) => {
    await movementService.completeMovement(id);
    // Refresh detail view
  }}
  onCancel={async (id, reason) => {
    await movementService.cancelMovement(id, reason);
    // Refresh detail view
  }}
  onHold={async (id, reason) => {
    await movementService.holdMovement(id, reason);
    // Refresh detail view
  }}
  onRelease={async (id) => {
    await movementService.releaseMovement(id);
    // Refresh detail view
  }}
/>
```

## Full Example

See `/frontend/src/pages/movements/MovementsPage.example.tsx` for a complete working example.

## Backend API Endpoints

The components work with these backend endpoints:

### Movement Controller (`/api/movements`)

**Create:**
- `POST /api/movements` - Create movement with lines and tasks

**Read:**
- `GET /api/movements/{id}` - Get movement by ID
- `GET /api/movements` - Get all movements (paginated)
- `GET /api/movements/reference/{refNumber}` - Get by reference
- `GET /api/movements/warehouse/{warehouseId}` - Get by warehouse
- `GET /api/movements/status/{status}` - Get by status
- `GET /api/movements/type/{type}` - Get by type
- `GET /api/movements/search?searchTerm=...` - Search movements

**Update:**
- `PUT /api/movements/{id}` - Update movement

**Delete:**
- `DELETE /api/movements/{id}` - Delete (only DRAFT/CANCELLED)

**Actions:**
- `POST /api/movements/{id}/start` - Start movement
- `POST /api/movements/{id}/complete` - Complete movement
- `POST /api/movements/{id}/cancel?reason=...` - Cancel with reason
- `POST /api/movements/{id}/hold?reason=...` - Put on hold
- `POST /api/movements/{id}/release` - Release from hold

### Movement Line Controller (`/api/movement-lines`)

**CRUD Operations:**
- `POST /api/movement-lines/movement/{movementId}` - Add line
- `GET /api/movement-lines/{id}` - Get line by ID
- `GET /api/movement-lines/movement/{movementId}` - Get all lines
- `PUT /api/movement-lines/{id}` - Update line
- `DELETE /api/movement-lines/{id}` - Delete line

**Actions:**
- `PATCH /api/movement-lines/{id}/actual-quantity?actualQuantity=...` - Update actual quantity
- `POST /api/movement-lines/{id}/complete` - Complete line

### Movement Task Controller (`/api/movement-tasks`)

**CRUD Operations:**
- `POST /api/movement-tasks/movement/{movementId}` - Create task
- `GET /api/movement-tasks/{id}` - Get task by ID
- `GET /api/movement-tasks/movement/{movementId}` - Get all tasks
- `PUT /api/movement-tasks/{taskId}` - Update task
- `DELETE /api/movement-tasks/{taskId}` - Delete task

**Actions:**
- `POST /api/movement-tasks/{taskId}/assign?assignToUserId=...` - Assign task
- `POST /api/movement-tasks/{taskId}/start` - Start task
- `POST /api/movement-tasks/{taskId}/complete` - Complete task
- `POST /api/movement-tasks/{taskId}/cancel?reason=...` - Cancel task

## TypeScript Types

All types are defined in `/frontend/src/types/index.ts`:

### Enums
- `MovementType` - RECEIPT, ISSUE, TRANSFER, ADJUSTMENT, etc.
- `MovementStatus` - DRAFT, PENDING, IN_PROGRESS, COMPLETED, etc.
- `MovementPriority` - LOW, NORMAL, HIGH, URGENT, CRITICAL
- `LineStatus` - PENDING, ALLOCATED, PICKED, COMPLETED, etc.
- `TaskType` - PICK, PACK, PUT_AWAY, COUNT, etc.
- `TaskStatus` - PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, etc.

### Interfaces
- `Movement` - Main movement entity
- `MovementLine` - Movement line entity
- `MovementTask` - Movement task entity
- `MovementRequestDto` - Request DTO for creating/updating
- `MovementLineRequestDto` - Line request DTO
- `MovementTaskRequestDto` - Task request DTO

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Movement Service API Call
    ↓
Backend API (Java Spring Boot)
    ↓
Database Update
    ↓
Response Back to Frontend
    ↓
Refresh Component State
    ↓
UI Update
```

## Features

### MovementFormModal
- **3 Tabs:** Details, Lines, Tasks
- **Details Tab:** All movement fields (type, warehouse, priority, status, locations, dates, reference, notes, reason)
- **Lines Tab:**
  - Dynamic add/remove lines
  - Auto line numbering
  - Fields: item, quantities, UOM, locations, status, notes
- **Tasks Tab:**
  - Optional task management
  - Fields: task type, priority, assigned user, timing, instructions
- **Validation:** Required fields marked, minimum 1 line required

### MovementDetailModal
- **Professional Header:** Status and priority badges
- **Action Buttons:** Conditional based on status
  - Edit (DRAFT/PENDING only)
  - Delete (DRAFT/CANCELLED only)
  - Start (DRAFT/PENDING)
  - Complete (IN_PROGRESS/PARTIALLY_COMPLETED)
  - Cancel (not COMPLETED/CANCELLED)
  - Hold (IN_PROGRESS/PENDING)
  - Release (ON_HOLD only)
- **3 Tabs:** Details, Lines, Tasks
- **Details Tab:**
  - Summary stats (Total Lines, Completed Lines, Pending Tasks)
  - Movement Information
  - Dates & Timeline
  - Additional Information (notes, reason)
  - Audit Information
- **Lines Tab:**
  - Card-based display with status badges
  - Quantity display with variance calculations
- **Tasks Tab:**
  - Card-based display with priority indicators
  - Timeline information
  - Overdue indicators

## Customization

### Adding More Fields

1. Update TypeScript types in `/frontend/src/types/index.ts`
2. Update backend DTOs
3. Add fields to `MovementFormModal.tsx`
4. Add fields to `MovementDetailModal.tsx`

### Styling

Components use Tailwind CSS classes. Modify the className attributes to customize styling.

### Color Schemes

Status and priority colors are defined in the `getStatusColor()` and `getPriorityColor()` functions in `MovementDetailModal.tsx`.

## Testing

```bash
# Run the example page
npm run dev

# Navigate to your movements page
# Click "Create Movement" to test form
# Click on a movement to test detail view
```

## Troubleshooting

### "Warehouses/Locations/Items are empty"
- Check that the backend services are running
- Verify API endpoints in `/frontend/src/config/constants.ts`
- Check network tab for API errors

### "Cannot create movement"
- Ensure at least 1 line is added
- Check required fields are filled
- Verify warehouse is selected

### "Action buttons not showing"
- Action buttons are conditional based on movement status
- Check movement status matches the required state

## Need Help?

- Check the example page: `/frontend/src/pages/movements/MovementsPage.example.tsx`
- Review the backend controllers in `/movement-service/src/main/java/com/stock/movementservice/controller/`
- Check the movement service: `/frontend/src/services/movement.service.ts`
