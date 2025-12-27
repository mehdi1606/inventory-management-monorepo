# Quality Control Components Documentation

This directory contains components for managing quality control inspections and status changes.

## Components

### 1. QualityControlDetailModal
A professional detail view with status change functionality.

## Quick Start

### Important: How to Handle Status Changes Properly

When a status is changed, you **MUST** update the modal's data prop with the fresh data from the API. The modal will then automatically re-render with the new status.

### Example Usage (CORRECT WAY)

```tsx
import { QualityControlDetailModal } from '@/components/quality-controls/QualityControlDetailModal';
import { qualityService } from '@/services/quality.service';
import { QualityControl, QCStatus } from '@/types';

export const YourPage = () => {
  const [selectedQC, setSelectedQC] = useState<QualityControl | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // ✅ CORRECT: Update the state with fresh data from API
  const handleStatusChange = async (id: string, status: QCStatus) => {
    try {
      // Call API - it returns the updated quality control
      const updatedQC = await qualityService.updateQualityControlStatus(id, status);

      // ✅ KEY STEP: Update the modal's data with the fresh data
      setSelectedQC(updatedQC);

      // Optional: Refresh your list too
      await fetchQualityControls();

      alert(`Status changed to ${status}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update status');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const updatedQC = await qualityService.approveQualityControl(id);

      // ✅ KEY STEP: Update the modal's data
      setSelectedQC(updatedQC);

      alert('Approved successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to approve');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const updatedQC = await qualityService.rejectQualityControl(id, reason);

      // ✅ KEY STEP: Update the modal's data
      setSelectedQC(updatedQC);

      alert('Rejected');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reject');
    }
  };

  return (
    <QualityControlDetailModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      data={selectedQC}  // This gets updated after status changes
      onStatusChange={handleStatusChange}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
};
```

### ❌ WRONG WAY (Don't do this)

```tsx
// ❌ This will NOT update the UI because you're not updating the state
const handleStatusChange = async (id: string, status: QCStatus) => {
  await qualityService.updateQualityControlStatus(id, status);
  // Missing: setSelectedQC(updatedQC)
  // The modal still has old data!
};
```

## Available Status Changes

### QCStatus Enum
- `PENDING` - Inspection not yet started
- `IN_PROGRESS` - Currently being inspected
- `PASSED` - Inspection passed
- `FAILED` - Inspection failed
- `QUARANTINED` - Item quarantined
- `CONDITIONAL_ACCEPT` - Conditionally accepted

### Available Actions

1. **Change Status** - Shows when status is not PASSED or FAILED
   - Opens a dropdown with all available statuses
   - Updates immediately when selected

2. **Approve** - Shows when status is PASSED and not yet approved
   - One-click approval
   - Records approver and approval time

3. **Reject** - Shows when status is not FAILED
   - Requires rejection reason
   - Opens a dialog to enter reason

## API Endpoints Used

The backend endpoints are:
- `PATCH /api/quality/controls/{id}/status?status=PASSED` - Change status
- `PATCH /api/quality/controls/{id}/approve` - Approve
- `PATCH /api/quality/controls/{id}/reject?reason=...` - Reject

All endpoints return the updated `QualityControl` object.

## Complete Working Example

See `/frontend/src/pages/quality-controls/QualityControlsPage.example.tsx` for a full implementation showing:
- ✅ Fetching quality controls list
- ✅ Viewing details
- ✅ Changing status with proper data refresh
- ✅ Approving inspections
- ✅ Rejecting with reasons
- ✅ Deleting quality controls

## Common Issues & Solutions

### Issue: Status doesn't change in the UI

**Problem:** You're not updating the modal's `data` prop after the API call.

**Solution:**
```tsx
const handleStatusChange = async (id: string, status: QCStatus) => {
  const updatedQC = await qualityService.updateQualityControlStatus(id, status);
  setSelectedQC(updatedQC); // ← Add this line!
};
```

### Issue: Modal shows old data after status change

**Problem:** You're calling the API but not passing the updated data back to the modal.

**Solution:** Always update your state with the response from the API:
```tsx
const updatedQC = await qualityService.updateQualityControlStatus(id, status);
setSelectedQC(updatedQC); // Updates the modal
```

### Issue: List doesn't refresh after status change

**Problem:** The modal is updated but the main list still shows old status.

**Solution:** Refresh your list after the status change:
```tsx
const handleStatusChange = async (id: string, status: QCStatus) => {
  const updatedQC = await qualityService.updateQualityControlStatus(id, status);
  setSelectedQC(updatedQC); // Update modal
  await fetchQualityControls(); // Update list
};
```

## Service Methods

```typescript
import { qualityService } from '@/services/quality.service';

// Change status - returns updated QC
const updated = await qualityService.updateQualityControlStatus(id, 'PASSED');

// Approve - returns updated QC
const approved = await qualityService.approveQualityControl(id);

// Reject - returns updated QC
const rejected = await qualityService.rejectQualityControl(id, 'Failed quality check');
```

## Data Flow

```
User clicks "Change Status"
    ↓
Select new status from dropdown
    ↓
handleStatusChange(id, status) called
    ↓
API call: qualityService.updateQualityControlStatus(id, status)
    ↓
Backend updates database
    ↓
Backend returns updated QualityControl object
    ↓
setSelectedQC(updatedQC) - Update state
    ↓
Modal re-renders with new status ✅
```

## Props Reference

### QualityControlDetailModal Props

```typescript
interface QualityControlDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QualityControl | null;  // Updated after each action
  onStatusChange?: (id: string, status: QCStatus) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onEdit?: (data: QualityControl) => void;
  onDelete?: (id: string) => void;
}
```

## Testing

To test the status change functionality:

1. Open a quality control detail
2. Click "Change Status"
3. Select a new status (e.g., PASSED)
4. The modal should immediately show the new status badge
5. Close and reopen - the status should still be updated

If the status doesn't update, check that you're following the pattern in the example above!
