import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from './Modal';
import { Button } from './Button';

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message,
  itemName,
  loading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
}: DeleteConfirmDialogProps) => {
  const defaultMessage = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : 'Are you sure you want to delete this item? This action cannot be undone.';

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      showCloseButton={!loading}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4',
            variant === 'danger'
              ? 'bg-danger/10 dark:bg-danger/20'
              : 'bg-warning/10 dark:bg-warning/20'
          )}
        >
          <AlertTriangle
            className={cn(
              'w-8 h-8',
              variant === 'danger' ? 'text-danger' : 'text-warning'
            )}
          />
        </motion.div>

        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {title}
        </h3>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          {message || defaultMessage}
        </p>

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'warning'}
            onClick={handleConfirm}
            loading={loading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

