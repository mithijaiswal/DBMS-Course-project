'use client';

import React, { useState } from 'react';
import {
  Wrench,
  UserCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface TechniciansViewProps {
  technicians: any[];
  onRefresh: () => void;
}

export function TechniciansView({ technicians, onRefresh }: TechniciansViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialization, setSpecialization] = useState('Electrical');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStatusToggle = async (techId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Available' ? 'Busy' : 'Available';
    try {
      await fetch('/api/technicians', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ TechnicianID: techId, AvailabilityStatus: nextStatus }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FirstName: firstName.trim(),
          LastName: lastName.trim(),
          Specialization: specialization,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add technician');
      }

      setShowAddModal(false);
      setFirstName('');
      setLastName('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error adding technician');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="warm-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#2A2521] flex items-center gap-2">
            Campus Maintenance Engineering Roster
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF4FA] text-[#275685] border border-[#CDE0F3]">
              {technicians.length} Technicians
            </span>
          </h2>
          <p className="text-xs text-[#7C7367] mt-1">
            Track technician specializations, active job orders, and live availability status.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Technician</span>
        </button>
      </div>

      {/* Grid of Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((t) => {
          const assignments = t.ASSIGNMENT || [];
          const activeTasks = assignments.filter((a: any) => !a.CompletionDate);
          const totalHours = assignments.flatMap((a: any) => a.WORK_LOG || []).reduce((acc: number, l: any) => acc + Number(l.HoursSpent), 0);
          const isAvailable = t.AvailabilityStatus === 'Available';

          return (
            <div
              key={t.TechnicianID}
              className="warm-card p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] text-[#C86446] font-bold text-xs flex items-center justify-center border border-[#F3CABE]">
                    {t.FirstName[0]}{t.LastName[0]}
                  </div>
                  <button
                    onClick={() => handleStatusToggle(t.TechnicianID, t.AvailabilityStatus)}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border cursor-pointer transition-colors ${
                      isAvailable
                        ? 'bg-[#EDF5F0] text-[#2C6645] border-[#C8E3D2] hover:bg-[#E2F0E6]'
                        : 'bg-[#FEF7E9] text-[#966512] border-[#F7DFB3] hover:bg-[#FDF0D5]'
                    }`}
                    title="Click to toggle status"
                  >
                    ● {t.AvailabilityStatus} (Click to Toggle)
                  </button>
                </div>

                <div className="font-bold text-sm text-[#2A2521]">
                  {t.FirstName} {t.LastName}
                </div>
                <div className="text-xs text-[#7C7367]">
                  Specialty: <span className="font-semibold text-[#4A433A]">{t.Specialization}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE5DC] flex items-center justify-between text-xs text-[#6B6155]">
                <div className="flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-[#C86446]" />
                  <span>{activeTasks.length} active ticket{activeTasks.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-[#2A2521]">
                  <Clock className="w-3.5 h-3.5 text-[#966512]" />
                  <span>{totalHours.toFixed(1)} hrs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Technician Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">
                Register New Technician
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTechnician} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Anand"
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Verma"
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full warm-input"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Networking">Networking</option>
                  <option value="Furniture">Furniture</option>
                  <option value="HVAC Specialist">HVAC Specialist</option>
                  <option value="Civil & Carpentry">Civil & Carpentry</option>
                  <option value="Audio-Visual">Audio-Visual</option>
                  <option value="General Maintenance">General Maintenance</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Add Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
