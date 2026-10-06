'use client';

import React from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  UserCheck,
  Wrench,
  AlertCircle,
  Package,
  Star,
} from 'lucide-react';

interface RequestsTableProps {
  requests: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  categories: any[];
  priorities: any[];
  onSelectRequest: (r: any) => void;
  onAssignRequest: (r: any) => void;
  onDeleteRequest: (r: any) => void;
  isLoading: boolean;
}

export function RequestsTable({
  requests,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  priorities,
  onSelectRequest,
  onAssignRequest,
  onDeleteRequest,
  isLoading,
}: RequestsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#F6F3EB] text-[#766958] border-[#E5DFD3]';
      case 'Assigned':
        return 'bg-[#EFF4FA] text-[#275685] border-[#CDE0F3]';
      case 'In Progress':
        return 'bg-[#FEF7E9] text-[#966512] border-[#F7DFB3]';
      case 'Completed':
      case 'Closed':
        return 'bg-[#EDF5F0] text-[#2C6645] border-[#C8E3D2]';
      case 'Cancelled':
        return 'bg-[#FDF1F0] text-[#B43834] border-[#F8CBC9]';
      default:
        return 'bg-[#F6F3EB] text-[#766958] border-[#E5DFD3]';
    }
  };

  const getPriorityBadge = (priorityName: string) => {
    switch (priorityName) {
      case 'Critical':
        return 'bg-[#FDF1F0] text-[#B43834] border-[#F8CBC9] font-semibold';
      case 'High':
        return 'bg-[#FEF1EC] text-[#BA4B27] border-[#F8CFC3] font-medium';
      case 'Medium':
        return 'bg-[#FEF7E9] text-[#966512] border-[#F7DFB3]';
      case 'Low':
        return 'bg-[#EDF5F0] text-[#2C6645] border-[#C8E3D2]';
      default:
        return 'bg-[#F6F3EB] text-[#766958] border-[#E5DFD3]';
    }
  };

  return (
    <div className="warm-card overflow-hidden">
      {/* Control bar */}
      <div className="p-4 border-b border-[#EAE5DC] bg-[#FAF8F5]/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9084]" />
            <input
              type="text"
              placeholder="Search by ticket #, description, user, room, building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#EAE5DC] bg-white text-[#2A2521] focus:outline-none focus:border-[#C86446] focus:ring-1 focus:ring-[#C86446]"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-[#EAE5DC] bg-white text-[#4A433A] focus:outline-none focus:border-[#C86446]"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-[#EAE5DC] bg-white text-[#4A433A] focus:outline-none focus:border-[#C86446]"
          >
            <option value="all">All Priorities</option>
            {priorities.map((p) => (
              <option key={p.PriorityID} value={p.PriorityID}>
                {p.LevelName} ({p.ResponseTime})
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-[#EAE5DC] bg-white text-[#4A433A] focus:outline-none focus:border-[#C86446]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.CategoryID} value={c.CategoryID}>
                {c.CategoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#877E73]">
          <span>Showing <strong className="text-[#2A2521]">{requests.length}</strong> tickets</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#EAE5DC] bg-[#F7F5F0] text-[#746C63] font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Problem Description</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority SLA</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned Tech</th>
              <th className="py-3 px-4">Costs & Work</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE5DC]">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#91877A]">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-[#C86446] border-t-transparent rounded-full mb-2" />
                  <div>Loading maintenance records...</div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#91877A]">
                  <AlertCircle className="w-8 h-8 text-[#B8AF9F] mx-auto mb-2" />
                  <div className="font-medium text-[#4A433A]">No maintenance requests found</div>
                  <div className="text-xs text-[#91877A] mt-0.5">
                    Try adjusting your search criteria or log a new maintenance ticket.
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((r) => {
                const assigned = r.ASSIGNMENT?.[0];
                const tech = assigned?.TECHNICIANS;
                const totalCost = r.COST?.reduce((sum: number, c: any) => sum + Number(c.Amount), 0) || 0;
                const feedback = r.FEEDBACK?.[0];

                return (
                  <tr
                    key={r.RequestID}
                    className="hover:bg-[#FAF8F5] transition-colors group cursor-pointer"
                    onClick={() => onSelectRequest(r)}
                  >
                    {/* Ticket ID & Submitter */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A2521] text-xs">
                        #{r.RequestID}
                      </div>
                      <div className="text-[11px] text-[#7B7165] flex items-center gap-1 mt-0.5">
                        <span>{r.USERS?.FirstName} {r.USERS?.LastName}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EFEBE4] text-[#696053]">
                          {r.USERS?.UserRole}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#A1978A] mt-0.5">
                        {new Date(r.DateSubmitted).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-[#2A2521] line-clamp-2 leading-relaxed">
                        {r.Description}
                      </div>
                      {feedback && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#A67812]">
                          <Star className="w-3 h-3 fill-[#EAB308] text-[#EAB308]" />
                          <span>Rating: {feedback.Rating}/5</span>
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#38322B]">
                        Room {r.ROOMS?.RoomNumber}
                      </div>
                      <div className="text-[11px] text-[#82786D] truncate max-w-[130px]">
                        {r.ROOMS?.BUILDINGS?.Name}
                      </div>
                      <div className="text-[10px] text-[#A69C8F]">
                        Floor {r.ROOMS?.FloorLevel}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#F4EFE6] text-[#554C41] border border-[#E3DCcf] font-medium text-[11px]">
                        {r.CATEGORIES?.CategoryName}
                      </span>
                    </td>

                    {/* Priority & SLA */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] ${getPriorityBadge(
                          r.PRIORITY?.LevelName
                        )}`}
                      >
                        {r.PRIORITY?.LevelName}
                      </span>
                      <div className="text-[10px] text-[#9A9084] mt-1">
                        SLA: {r.PRIORITY?.ResponseTime}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${getStatusBadge(
                          r.CurrentStatus
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        {r.CurrentStatus}
                      </span>
                    </td>

                    {/* Technician */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tech ? (
                        <div>
                          <div className="font-medium text-[#2A2521] flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-[#3D7858]" />
                            <span>{tech.FirstName} {tech.LastName}</span>
                          </div>
                          <div className="text-[10px] text-[#8E8376]">
                            {tech.Specialization}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignRequest(r);
                          }}
                          className="px-2 py-1 rounded bg-[#F8F4EE] hover:bg-[#EFE8DC] text-[#7C6E5C] hover:text-[#2A2521] border border-[#E2DBD0] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Wrench className="w-3 h-3 text-[#C86446]" />
                          <span>Assign</span>
                        </button>
                      )}
                    </td>

                    {/* Costs & Materials */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#2A2521]">
                        {totalCost > 0 ? `₹${totalCost.toLocaleString('en-IN')}` : '₹0'}
                      </div>
                      <div className="text-[10px] text-[#8E8376] flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Package className="w-3 h-3 text-[#9A9084]" />
                          {r.REQUEST_MATERIALS?.length || 0} mat
                        </span>
                        <span>•</span>
                        <span>{r.ASSIGNMENT?.[0]?.WORK_LOG?.length || 0} logs</span>
                      </div>
                    </td>

                    {/* Row Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectRequest(r)}
                          title="View Request Details & Timeline"
                          className="p-1.5 rounded-md hover:bg-[#EFE9DD] text-[#695F52] hover:text-[#2A2521] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRequest(r)}
                          title="Delete Request (Cascades all foreign keys)"
                          className="p-1.5 rounded-md hover:bg-[#FBEFEF] text-[#9A9084] hover:text-[#B43834] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
