'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
  Star,
  Users,
  IndianRupee,
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: any;
  onRefresh: () => void;
}

export function AnalyticsView({ analytics, onRefresh }: AnalyticsViewProps) {
  if (!analytics || !analytics.reports) {
    return (
      <div className="warm-card p-12 text-center text-[#91877A]">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-[#C86446] border-t-transparent rounded-full mb-2" />
        <div>Computing DBMS SQL Aggregates & Analytical Reports...</div>
      </div>
    );
  }

  const {
    pendingAgeing,
    prioritySLA,
    technicianLoad,
    buildingCost,
    materialUsage,
    feedbackAnalysis,
  } = analytics.reports;

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="warm-card p-5 bg-gradient-to-r from-[#FAF8F5] via-white to-[#FDF5F2] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#2A2521] flex items-center gap-2">
            Campus Facility Maintenance Reports & SQL Aggregates
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDF5F0] text-[#2C6645] border border-[#C8E3D2]">
              6 Mandatory PBL Reports Active
            </span>
          </h2>
          <p className="text-xs text-[#7C7367] mt-1">
            Real-time aggregate calculations, grouping, joins, and SLA tracking directly from MySQL.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3.5 py-1.5 rounded-lg border border-[#EAE5DC] bg-white text-xs font-semibold text-[#5A5044] hover:bg-[#F5F1EB] transition-colors shadow-2xs cursor-pointer self-start md:self-auto"
        >
          Recalculate Metrics
        </button>
      </div>

      {/* Grid of Report 1 & Report 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REPORT 1: Pending Requests & Ageing */}
        <div className="warm-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#FEF7E9] text-[#966512]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#2A2521]">
                  Report 1: Pending Requests & Ageing Analysis
                </h3>
                <p className="text-[10px] text-[#8C8276]">
                  Days elapsed since ticket submission without closure
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#C86446]">
              {pendingAgeing.list.length} Unresolved
            </span>
          </div>

          {/* Aging Buckets */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-[#EDF5F0] border border-[#C8E3D2]">
              <div className="text-[10px] text-[#2C6645] font-medium">≤ 3 Days</div>
              <div className="text-base font-bold text-[#1E5234]">
                {pendingAgeing.buckets.under3Days}
              </div>
              <div className="text-[9px] text-[#2C6645]">Within SLA</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FEF7E9] border border-[#F7DFB3]">
              <div className="text-[10px] text-[#966512] font-medium">4 – 7 Days</div>
              <div className="text-base font-bold text-[#7E520B]">
                {pendingAgeing.buckets.threeToSevenDays}
              </div>
              <div className="text-[9px] text-[#966512]">Aging</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9]">
              <div className="text-[10px] text-[#B43834] font-medium">&gt; 7 Days</div>
              <div className="text-base font-bold text-[#8E2522]">
                {pendingAgeing.buckets.over7Days}
              </div>
              <div className="text-[9px] text-[#B43834]">High Overdue</div>
            </div>
          </div>

          {/* Ageing Table Snippet */}
          <div className="max-h-56 overflow-y-auto border border-[#EAE5DC] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#7C7367] text-[10px] font-semibold border-b border-[#EAE5DC]">
                <tr>
                  <th className="py-2 px-3">Ticket</th>
                  <th className="py-2 px-3">Requester</th>
                  <th className="py-2 px-3">Room</th>
                  <th className="py-2 px-3 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC]">
                {pendingAgeing.list.map((r: any) => (
                  <tr key={r.requestId} className="hover:bg-[#FAF8F5]">
                    <td className="py-2 px-3 font-semibold text-[#2A2521]">
                      #{r.requestId}
                    </td>
                    <td className="py-2 px-3 text-[#5A5044]">{r.user}</td>
                    <td className="py-2 px-3 text-[#5A5044]">{r.room} ({r.building})</td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.ageDays > 7
                            ? 'bg-[#FDF1F0] text-[#B43834]'
                            : r.ageDays > 3
                            ? 'bg-[#FEF7E9] text-[#966512]'
                            : 'bg-[#EDF5F0] text-[#2C6645]'
                        }`}
                      >
                        {r.ageDays}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* REPORT 2: Priority SLA Performance */}
        <div className="warm-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#FDF3EF] text-[#C86446]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#2A2521]">
                  Report 2: Response Time & Priority SLA Targets
                </h3>
                <p className="text-[10px] text-[#8C8276]">
                  Resolution completion performance grouped by SLA priority tier
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {prioritySLA.map((item: any) => (
              <div
                key={item.priorityId}
                className="p-3 rounded-xl border border-[#EAE5DC] bg-[#FAF8F5]/50 space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="font-semibold text-[#2A2521] flex items-center gap-2">
                    <span>{item.levelName} Priority</span>
                    <span className="text-[10px] text-[#8C8276]">
                      (Target SLA: {item.slaTarget})
                    </span>
                  </div>
                  <span className="font-bold text-xs text-[#C86446]">
                    {item.completedTickets}/{item.totalTickets} tickets ({item.completionRate}%)
                  </span>
                </div>
                <div className="w-full bg-[#EAE5DC] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#C86446] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Report 3 & Report 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REPORT 3: Technician Workload Analysis */}
        <div className="warm-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#EDF5F0] text-[#2C6645]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#2A2521]">
                  Report 3: Technician Workload & Assigned Hours
                </h3>
                <p className="text-[10px] text-[#8C8276]">
                  Join between TECHNICIANS, ASSIGNMENTS, and WORK_LOG
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {technicianLoad.map((t: any) => (
              <div
                key={t.technicianId}
                className="p-3 rounded-xl border border-[#EAE5DC] bg-white flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#2A2521]">{t.name}</div>
                  <div className="text-[11px] text-[#7E7468]">
                    {t.specialization} • Active Tickets: <strong>{t.activeTasks}</strong> • Completed: {t.completedTasks}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-[#2A2521]">
                    {t.totalHours} hrs
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                      t.workloadLevel === 'Heavy'
                        ? 'bg-[#FEF7E9] text-[#966512]'
                        : 'bg-[#EDF5F0] text-[#2C6645]'
                    }`}
                  >
                    {t.workloadLevel} Load
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REPORT 4: Building-wise Maintenance Expenditure */}
        <div className="warm-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#FDF3EF] text-[#C86446]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#2A2521]">
                  Report 4: Building-wise Maintenance Expenditure
                </h3>
                <p className="text-[10px] text-[#8C8276]">
                  Aggregate costs across campus zones and faculties
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {buildingCost.map((b: any) => (
              <div
                key={b.buildingId}
                className="p-3 rounded-xl border border-[#EAE5DC] bg-white flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#2A2521]">{b.buildingName}</div>
                  <div className="text-[11px] text-[#7E7468]">
                    {b.campusLocation} • {b.requestCount} requests logged
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-[#C86446]">
                    ₹{b.totalCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#91877A]">Total Incurred</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Report 5 & Report 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REPORT 5: Material Depletion & Inventory Health */}
        <div className="warm-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#FAF0EB] text-[#C86446]">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#2A2521]">
                  Report 5: Material Usage & Inventory Depletion
                </h3>
                <p className="text-[10px] text-[#8C8276]">
                  Consumption tracking & low-stock warning thresholds
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto border border-[#EAE5DC] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#7C7367] text-[10px] font-semibold border-b border-[#EAE5DC]">
                <tr>
                  <th className="py-2 px-3">Material</th>
                  <th className="py-2 px-3">Stock Left</th>
                  <th className="py-2 px-3">Qty Used</th>
                  <th className="py-2 px-3 text-right">Value Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC]">
                {materialUsage.map((m: any) => (
                  <tr key={m.materialId} className="hover:bg-[#FAF8F5]">
                    <td className="py-2 px-3 font-semibold text-[#2A2521]">
                      {m.materialName}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.isLowStock
                            ? 'bg-[#FDF1F0] text-[#B43834]'
                            : 'bg-[#EDF5F0] text-[#2C6645]'
                        }`}
                      >
                        {m.quantityInStock} left
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#5A5044]">{m.totalQuantityUsed} units</td>
                    <td className="py-2 px-3 text-right font-bold text-[#C86446]">
                      ₹{m.totalValueConsumed.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* REPORT 6: Feedback & Satisfaction */}
        <div className="warm-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#FEF7E9] text-[#966512]">
                <Star className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#2A2521]">
                  Report 6: User Feedback & Service Satisfaction
                </h3>
                <p className="text-[10px] text-[#8C8276]">
                  Average user evaluation after service closure
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-bold text-base text-[#2A2521]">
                {feedbackAnalysis.average}
              </span>
              <span className="text-[10px] text-[#8C8276]">/ 5.0</span>
            </div>
          </div>

          {/* Star Distribution */}
          <div className="space-y-1.5 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = feedbackAnalysis.distribution[stars] || 0;
              const pct = feedbackAnalysis.totalCount > 0 ? (count / feedbackAnalysis.totalCount) * 100 : 0;

              return (
                <div key={stars} className="flex items-center space-x-2">
                  <span className="w-8 text-[11px] font-medium text-[#7C7367]">
                    {stars} ★
                  </span>
                  <div className="flex-1 bg-[#EAE5DC] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#F59E0B] h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-[11px] text-right font-semibold text-[#2A2521]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recent Comments */}
          <div className="space-y-2 max-h-40 overflow-y-auto pt-2">
            {feedbackAnalysis.feedbacks.slice(0, 3).map((f: any) => (
              <div
                key={f.FeedbackID}
                className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2A2521]">
                    Ticket #{f.RequestID} • {f.REQUESTS?.CATEGORIES?.CategoryName}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(f.Rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                </div>
                <p className="text-[#5A5044] italic">"{f.Comments}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
