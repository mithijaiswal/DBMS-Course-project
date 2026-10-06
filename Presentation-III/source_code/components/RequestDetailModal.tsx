'use client';

import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  MapPin,
  Calendar,
  Wrench,
  Package,
  IndianRupee,
  Star,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onAssignTech: () => void;
  onAddWorkLog: () => void;
  onAddMaterial: () => void;
  onAddFeedback: () => void;
  onStatusChange: (newStatus: string) => void;
  onDelete: () => void;
}

export function RequestDetailModal({
  isOpen,
  onClose,
  request,
  onAssignTech,
  onAddWorkLog,
  onAddMaterial,
  onAddFeedback,
  onStatusChange,
  onDelete,
}: RequestDetailModalProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  if (!isOpen || !request) return null;

  const totalCost = request.COST?.reduce((sum: number, c: any) => sum + Number(c.Amount), 0) || 0;
  const assignment = request.ASSIGNMENT?.[0];
  const technician = assignment?.TECHNICIANS;
  const workLogs = assignment?.WORK_LOG || [];
  const materials = request.REQUEST_MATERIALS || [];
  const feedback = request.FEEDBACK?.[0];
  const statusHistory = request.STATUS_HISTORY || [];

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && val !== request.CurrentStatus) {
      setIsChangingStatus(true);
      await onStatusChange(val);
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF3EF] border border-[#F3CABE] text-[#C86446] font-bold text-sm flex items-center justify-center">
              #{request.RequestID}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#2A2521]">
                  Maintenance Request #{request.RequestID}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF0EB] text-[#C86446] border border-[#F3CABE]">
                  {request.CATEGORIES?.CategoryName}
                </span>
              </div>
              <div className="text-[11px] text-[#7C7367] flex items-center gap-2 mt-0.5">
                <span>Submitted on {new Date(request.DateSubmitted).toLocaleDateString()}</span>
                <span>•</span>
                <span>Priority: <strong className="text-[#2A2521]">{request.PRIORITY?.LevelName} ({request.PRIORITY?.ResponseTime})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status change selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-[#7C7367]">Status:</span>
              <select
                value={request.CurrentStatus}
                onChange={handleStatusSelect}
                disabled={isChangingStatus}
                className="text-xs font-semibold rounded-lg px-2.5 py-1 bg-[#F5F1EB] border border-[#E0D8CB] text-[#3A332B] focus:outline-none focus:border-[#C86446] cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          {/* Problem Statement Card */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
            <span className="text-[10px] uppercase font-bold text-[#91877A] tracking-wider block mb-1">
              Issue Description
            </span>
            <p className="text-sm font-medium text-[#2A2521] leading-relaxed">
              {request.Description}
            </p>
          </div>

          {/* Grid of requester & location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Submitter Card */}
            <div className="p-4 rounded-xl border border-[#EAE5DC] bg-white space-y-2">
              <div className="flex items-center space-x-2 text-[#7C7367] font-semibold text-[11px]">
                <User className="w-4 h-4 text-[#C86446]" />
                <span>Requester Details</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-[#2A2521] text-sm">
                  {request.USERS?.FirstName} {request.USERS?.LastName}
                </div>
                <div className="text-[#6D6357]">
                  Role: <span className="font-medium text-[#2A2521]">{request.USERS?.UserRole}</span>
                </div>
                <div className="text-[#6D6357]">
                  Email: <span className="font-mono text-[#2A2521]">{request.USERS?.Email}</span>
                </div>
                {request.USERS?.PhoneNumber && (
                  <div className="text-[#6D6357]">
                    Phone: <span className="font-mono text-[#2A2521]">{request.USERS?.PhoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="p-4 rounded-xl border border-[#EAE5DC] bg-white space-y-2">
              <div className="flex items-center space-x-2 text-[#7C7367] font-semibold text-[11px]">
                <MapPin className="w-4 h-4 text-[#C86446]" />
                <span>Location & Facility Asset</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-[#2A2521] text-sm">
                  Room {request.ROOMS?.RoomNumber}
                </div>
                <div className="text-[#6D6357]">
                  Building: <span className="font-medium text-[#2A2521]">{request.ROOMS?.BUILDINGS?.Name}</span>
                </div>
                <div className="text-[#6D6357]">
                  Location: <span className="text-[#2A2521]">{request.ROOMS?.BUILDINGS?.CampusLocation}</span>
                </div>
                <div className="text-[#6D6357]">
                  Floor Level: <span className="text-[#2A2521]">Floor {request.ROOMS?.FloorLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Technician & Work Log */}
          <div className="p-4 rounded-xl border border-[#EAE5DC] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-xs text-[#2A2521]">
                <Wrench className="w-4 h-4 text-[#C86446]" />
                <span>Field Service & Technician Assignment</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onAssignTech}
                  className="px-2.5 py-1 rounded-md bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#E2DBD0] text-[11px] font-medium text-[#5A5044] flex items-center gap-1 cursor-pointer"
                >
                  <Wrench className="w-3 h-3 text-[#C86446]" />
                  <span>{technician ? 'Reassign Tech' : 'Assign Technician'}</span>
                </button>
                {assignment && (
                  <button
                    onClick={onAddWorkLog}
                    className="px-2.5 py-1 rounded-md bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#E2DBD0] text-[11px] font-medium text-[#5A5044] flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-[#966512]" />
                    <span>Log Labor</span>
                  </button>
                )}
              </div>
            </div>

            {technician ? (
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[#2A2521]">
                    {technician.FirstName} {technician.LastName}
                  </div>
                  <div className="text-[11px] text-[#7C7367]">
                    Specialization: {technician.Specialization} • Assigned: {new Date(assignment.AssignmentDate).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EDF5F0] text-[#2C6645] border border-[#C8E3D2]">
                  {assignment.CompletionDate ? 'Work Finished' : 'Active On Ticket'}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-dashed border-[#DDD7CD] text-[#8C8276] text-center text-xs">
                No field technician currently assigned to this ticket.
              </div>
            )}

            {/* Work Logs List */}
            {workLogs.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="font-semibold text-[11px] text-[#695F52]">
                  Logged Labor Entries:
                </span>
                <div className="space-y-1">
                  {workLogs.map((log: any) => (
                    <div
                      key={log.LogID}
                      className="p-2.5 rounded-lg border border-[#EAE5DC] bg-[#FAF8F5] flex justify-between items-center text-[11px]"
                    >
                      <div>
                        <div className="font-medium text-[#2A2521]">{log.Description}</div>
                        <div className="text-[10px] text-[#8C8276]">
                          {new Date(log.LogEntryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-semibold text-[#966512] bg-[#FEF7E9] px-2 py-0.5 rounded-full border border-[#F7DFB3]">
                        {log.HoursSpent} hrs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Materials & Costs Section */}
          <div className="p-4 rounded-xl border border-[#EAE5DC] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-xs text-[#2A2521]">
                <Package className="w-4 h-4 text-[#C86446]" />
                <span>Materials & Financial Expenditure</span>
              </div>
              <button
                onClick={onAddMaterial}
                className="px-2.5 py-1 rounded-md bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#E2DBD0] text-[11px] font-medium text-[#5A5044] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#C86446]" />
                <span>Allocate Material</span>
              </button>
            </div>

            {materials.length > 0 ? (
              <div className="space-y-1.5">
                {materials.map((rm: any, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-[#EAE5DC] bg-[#FAF8F5] flex justify-between items-center text-[11px]"
                  >
                    <div>
                      <div className="font-semibold text-[#2A2521]">{rm.MATERIALS?.MaterialName}</div>
                      <div className="text-[10px] text-[#8C8276]">
                        Quantity Used: <strong>{rm.QuantityUsed}</strong> @ ₹{Number(rm.MATERIALS?.UnitCost).toFixed(2)}/unit
                      </div>
                    </div>
                    <span className="font-bold text-[#C86446]">
                      ₹{(rm.QuantityUsed * Number(rm.MATERIALS?.UnitCost)).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-[#EAE5DC] pt-2 flex justify-between text-xs font-semibold text-[#2A2521]">
                  <span>Total Ticket Expenditure:</span>
                  <span className="text-[#C86446] text-sm">₹{totalCost.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-dashed border-[#DDD7CD] text-[#8C8276] text-center text-xs">
                No replacement parts or materials consumed yet.
              </div>
            )}
          </div>

          {/* Status History Audit Trail */}
          <div className="p-4 rounded-xl border border-[#EAE5DC] bg-white space-y-3">
            <div className="flex items-center space-x-2 font-semibold text-xs text-[#2A2521]">
              <Clock className="w-4 h-4 text-[#7C7367]" />
              <span>Status Audit Log (`STATUS_HISTORY` Table)</span>
            </div>

            <div className="relative pl-4 border-l-2 border-[#EAE5DC] space-y-3 ml-2">
              {statusHistory.map((sh: any, index: number) => (
                <div key={sh.StatusLogID || index} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#C86446] ring-4 ring-white" />
                  <div className="text-xs font-semibold text-[#2A2521] flex items-center gap-1.5">
                    <span>{sh.PreviousStatus ? `${sh.PreviousStatus} →` : 'Initiated:'}</span>
                    <span className="text-[#C86446]">{sh.NewStatus}</span>
                  </div>
                  <div className="text-[10px] text-[#8E8376] mt-0.5">
                    {new Date(sh.StatusChangeDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Feedback Card */}
          <div className="p-4 rounded-xl border border-[#EAE5DC] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-xs text-[#2A2521]">
                <Star className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
                <span>User Satisfaction Feedback</span>
              </div>
              {!feedback && (
                <button
                  onClick={onAddFeedback}
                  className="px-2.5 py-1 rounded-md bg-[#FEF7E9] hover:bg-[#FDF1D8] border border-[#F7DFB3] text-[11px] font-medium text-[#966512] flex items-center gap-1 cursor-pointer"
                >
                  <Star className="w-3 h-3" />
                  <span>Submit Feedback</span>
                </button>
              )}
            </div>

            {feedback ? (
              <div className="p-3 rounded-lg bg-[#FEF7E9]/50 border border-[#F7DFB3] space-y-1">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= feedback.Rating
                          ? 'fill-[#F59E0B] text-[#F59E0B]'
                          : 'text-[#DDD7CE]'
                      }`}
                    />
                  ))}
                  <span className="font-semibold text-xs text-[#845E16] ml-2">
                    {feedback.Rating} out of 5
                  </span>
                </div>
                <p className="text-xs text-[#3E372E] italic mt-1">"{feedback.Comments}"</p>
                <div className="text-[10px] text-[#9A9084]">
                  Submitted on {new Date(feedback.SubmissionDate).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-dashed border-[#DDD7CD] text-[#8C8276] text-center text-xs">
                Feedback has not been recorded yet. Available once technician completes work.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
          <button
            onClick={onDelete}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#F8CBC9] bg-[#FDF1F0] text-[#B43834] hover:bg-[#FBE6E5] text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Request (Cascading)</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F2ECE2] text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
