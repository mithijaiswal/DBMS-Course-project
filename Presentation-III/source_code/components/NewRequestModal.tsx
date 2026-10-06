'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  rooms: any[];
  categories: any[];
  priorities: any[];
  onSuccess: (newReq: any) => void;
}

export function NewRequestModal({
  isOpen,
  onClose,
  users,
  rooms,
  categories,
  priorities,
  onSuccess,
}: NewRequestModalProps) {
  const [userId, setUserId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [priorityId, setPriorityId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!userId || !roomId || !categoryId || !priorityId || !description.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: Number(userId),
          RoomID: Number(roomId),
          CategoryID: Number(categoryId),
          PriorityID: Number(priorityId),
          Description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request');
      }

      onSuccess(data.data);
      onClose();
      // Reset form
      setUserId('');
      setRoomId('');
      setCategoryId('');
      setPriorityId('');
      setDescription('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FDF1EC] text-[#C86446] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#2A2521]">
                Log Maintenance Request
              </h3>
              <p className="text-[11px] text-[#7E7468]">
                Submit a new campus maintenance ticket
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Requester User */}
            <div>
              <label className="block font-medium text-[#4A433A] mb-1">
                Requester / User <span className="text-[#C86446]">*</span>
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full warm-input"
              >
                <option value="">Select Requester...</option>
                {users.map((u) => (
                  <option key={u.UserID} value={u.UserID}>
                    {u.FirstName} {u.LastName} ({u.UserRole})
                  </option>
                ))}
              </select>
            </div>

            {/* Room & Building */}
            <div>
              <label className="block font-medium text-[#4A433A] mb-1">
                Room & Building <span className="text-[#C86446]">*</span>
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="w-full warm-input"
              >
                <option value="">Select Campus Room...</option>
                {rooms.map((r) => (
                  <option key={r.RoomID} value={r.RoomID}>
                    {r.RoomNumber} - {r.BUILDINGS?.Name || `Building ${r.BuildingID}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block font-medium text-[#4A433A] mb-1">
                Category <span className="text-[#C86446]">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full warm-input"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>
                    {c.CategoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-medium text-[#4A433A] mb-1">
                Priority Level <span className="text-[#C86446]">*</span>
              </label>
              <select
                value={priorityId}
                onChange={(e) => setPriorityId(e.target.value)}
                required
                className="w-full warm-input"
              >
                <option value="">Select Priority SLA...</option>
                {priorities.map((p) => (
                  <option key={p.PriorityID} value={p.PriorityID}>
                    {p.LevelName} ({p.ResponseTime} SLA)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-[#4A433A] mb-1">
              Problem Description <span className="text-[#C86446]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="e.g. Projector in Room A101 blinks on HDMI connection or water leak under sink..."
              className="w-full warm-input resize-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] text-[#7C7367]">
            <strong>Business Rule Enforced:</strong> New requests start with status <span className="font-semibold text-[#2A2521]">Pending</span>. A corresponding audit row is automatically written to <code className="text-[#C86446]">STATUS_HISTORY</code> table.
          </div>

          {/* Actions */}
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
              {isSubmitting ? 'Creating in Database...' : 'Save Maintenance Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
