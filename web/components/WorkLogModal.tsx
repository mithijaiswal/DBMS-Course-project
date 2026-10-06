'use client';

import React, { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';

interface WorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onSuccess: () => void;
}

export function WorkLogModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: WorkLogModalProps) {
  const [description, setDescription] = useState('');
  const [hoursSpent, setHoursSpent] = useState('1.5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !hoursSpent) {
      setErrorMessage('Please provide work description and hours spent');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch(`/api/requests/${request.RequestID}/worklog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Description: description.trim(),
          HoursSpent: parseFloat(hoursSpent),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add work log');
      }

      onSuccess();
      onClose();
      setDescription('');
      setHoursSpent('1.5');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error recording work log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEF7E9] text-[#966512] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#2A2521]">
                Log Technician Labor
              </h3>
              <p className="text-[11px] text-[#7E7468]">
                Inserts into MySQL `WORK_LOG` table
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#4A433A] mb-1">
              Labor Description / Repair Details <span className="text-[#C86446]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="e.g. Replaced capacitor, re-soldered connection, conducted voltage stress test..."
              className="w-full warm-input resize-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[#4A433A] mb-1">
              Hours Spent <span className="text-[#C86446]">*</span>
            </label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              required
              className="w-full warm-input"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] text-[#7C7367]">
            <strong>Status Automation:</strong> If the request was currently <span className="font-medium text-[#2A2521]">Assigned</span>, logging work automatically transitions the ticket to <span className="font-medium text-[#2A2521]">In Progress</span> and appends to <code className="text-[#C86446]">STATUS_HISTORY</code>.
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#F0EBE3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording Log...' : 'Record Labor Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
