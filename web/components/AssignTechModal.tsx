'use client';

import React, { useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';

interface AssignTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  technicians: any[];
  onSuccess: () => void;
}

export function AssignTechModal({
  isOpen,
  onClose,
  request,
  technicians,
  onSuccess,
}: AssignTechModalProps) {
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) {
      setErrorMessage('Please select a technician');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch(`/api/requests/${request.RequestID}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TechnicianID: Number(selectedTechId) }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to assign technician');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error assigning technician');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFF4FA] text-[#275685] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#2A2521]">
                Assign Technician
              </h3>
              <p className="text-[11px] text-[#7E7468]">
                Ticket #{request.RequestID} • {request.CATEGORIES?.CategoryName}
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
              Select Field Technician
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {technicians.map((tech) => {
                const isSelected = selectedTechId === String(tech.TechnicianID);
                const isAvailable = tech.AvailabilityStatus === 'Available';

                return (
                  <div
                    key={tech.TechnicianID}
                    onClick={() => setSelectedTechId(String(tech.TechnicianID))}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#C86446] bg-[#FDF3EF] ring-1 ring-[#C86446]'
                        : 'border-[#EAE5DC] hover:border-[#D9D1C5] bg-[#FFFFFF]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[#2A2521]">
                        {tech.FirstName} {tech.LastName}
                      </div>
                      <div className="text-[11px] text-[#7C7367]">
                        Specialization: <span className="font-medium">{tech.Specialization}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        isAvailable
                          ? 'bg-[#EDF5F0] text-[#2C6645] border-[#C8E3D2]'
                          : 'bg-[#FEF7E9] text-[#966512] border-[#F7DFB3]'
                      }`}
                    >
                      {tech.AvailabilityStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] text-[#7C7367]">
            <strong>Relational Action:</strong> Creating this assignment writes to <code className="text-[#C86446]">ASSIGNMENT</code>, sets technician to <span className="font-medium text-[#2A2521]">Busy</span>, updates ticket to <span className="font-medium text-[#2A2521]">Assigned</span>, and appends a transition row to <code className="text-[#C86446]">STATUS_HISTORY</code>.
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
              disabled={isSubmitting || !selectedTechId}
              className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
