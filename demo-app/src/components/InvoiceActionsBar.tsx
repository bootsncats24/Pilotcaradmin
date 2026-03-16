import React, { useEffect, useRef, useState } from 'react';
import { InvoiceStatus } from '../shared/types';

interface InvoiceActionsBarProps {
  status: InvoiceStatus;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: InvoiceStatus) => void;
}

export default function InvoiceActionsBar({
  status,
  onEdit,
  onDelete,
  onStatusChange,
}: InvoiceActionsBarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="invoice-actions-bar" onClick={(e) => e.stopPropagation()}>
      {onStatusChange && (
        <select
          className="btn btn-small invoice-status-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as InvoiceStatus)}
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )}

      {(onEdit || onDelete) && (
        <div
          className={`action-dropdown ${open ? 'open' : ''}`}
          ref={dropdownRef}
        >
          <button
            type="button"
            className="action-dropdown-toggle"
            onClick={() => setOpen(!open)}
          >
            <span>Actions</span>
            <span className="action-arrow">▼</span>
          </button>
          <div className="action-dropdown-menu">
            {onEdit && (
              <button
                type="button"
                className="action-dropdown-item"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="action-dropdown-item action-dropdown-item-danger"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

