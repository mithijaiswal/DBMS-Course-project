'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export function SqlConsoleView() {
  const presentation2Query = `SELECT 
  c.CategoryName AS Category, 
  p.LevelName AS Priority, 
  p.ResponseTime, 
  r.CurrentStatus AS Status
FROM REQUESTS r
JOIN USERS u ON r.UserID = u.UserID
JOIN CATEGORIES c ON r.CategoryID = c.CategoryID
JOIN PRIORITY p ON r.PriorityID = p.PriorityID
WHERE u.FirstName = 'Ananya' AND u.LastName = 'Rao';`;

  const [activeQuery, setActiveQuery] = useState(presentation2Query);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    {
      label: 'Presentation-II Query (Ananya Rao)',
      sql: presentation2Query,
    },
    {
      label: 'Pending Requests with Location & Submitter',
      sql: `SELECT 
  r.RequestID, 
  CONCAT(u.FirstName, ' ', u.LastName) AS Requester, 
  b.Name AS Building, 
  rm.RoomNumber, 
  r.CurrentStatus, 
  r.DateSubmitted
FROM REQUESTS r
JOIN USERS u ON r.UserID = u.UserID
JOIN ROOMS rm ON r.RoomID = rm.RoomID
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
WHERE r.CurrentStatus IN ('Pending', 'Assigned')
ORDER BY r.DateSubmitted ASC;`,
    },
    {
      label: 'Technician Load & Total Logged Hours',
      sql: `SELECT 
  t.TechnicianID,
  CONCAT(t.FirstName, ' ', t.LastName) AS Technician,
  t.Specialization,
  t.AvailabilityStatus,
  COUNT(DISTINCT a.AssignmentID) AS TotalAssignments,
  COALESCE(SUM(wl.HoursSpent), 0) AS TotalHoursLogged
FROM TECHNICIANS t
LEFT JOIN ASSIGNMENT a ON t.TechnicianID = a.TechnicianID
LEFT JOIN WORK_LOG wl ON a.AssignmentID = wl.AssignmentID
GROUP BY t.TechnicianID, t.FirstName, t.LastName, t.Specialization, t.AvailabilityStatus
ORDER BY TotalHoursLogged DESC;`,
    },
    {
      label: 'Building Maintenance Expenditure Summary',
      sql: `SELECT 
  b.BuildingID,
  b.Name AS BuildingName,
  b.CampusLocation,
  COUNT(DISTINCT r.RequestID) AS TotalRequests,
  COALESCE(SUM(c.Amount), 0) AS TotalCost_INR
FROM BUILDINGS b
LEFT JOIN ROOMS rm ON b.BuildingID = rm.BuildingID
LEFT JOIN REQUESTS r ON rm.RoomID = r.RoomID
LEFT JOIN COST c ON r.RequestID = c.RequestID
GROUP BY b.BuildingID, b.Name, b.CampusLocation
ORDER BY TotalCost_INR DESC;`,
    },
    {
      label: 'Inventory Material Consumption & Stock Remaining',
      sql: `SELECT 
  m.MaterialID,
  m.MaterialName,
  m.UnitCost,
  m.QuantityInStock AS RemainingStock,
  COALESCE(SUM(rm.QuantityUsed), 0) AS TotalQuantityUsed,
  COALESCE(SUM(rm.QuantityUsed * m.UnitCost), 0) AS TotalSpent_INR
FROM MATERIALS m
LEFT JOIN REQUEST_MATERIALS rm ON m.MaterialID = rm.MaterialID
GROUP BY m.MaterialID, m.MaterialName, m.UnitCost, m.QuantityInStock
ORDER BY TotalQuantityUsed DESC;`,
    },
  ];

  const handleExecute = async (sqlToRun?: string) => {
    const sql = sqlToRun || activeQuery;
    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'SQL Execution error');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Execution error');
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Banner: Presentation-II Verification */}
      <div className="warm-card p-5 border-l-4 border-l-[#C86446] bg-gradient-to-r from-[#FAF8F5] via-white to-[#FDF3EF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C86446]" />
              <h3 className="font-bold text-sm text-[#2A2521]">
                Presentation-II Evaluation Query Verifier
              </h3>
            </div>
            <p className="text-xs text-[#7C7367] mt-1">
              Exact SQL statement presented during Review 2: Multi-table relational query joining <code className="bg-[#FAF2EB] text-[#C86446] px-1 rounded">REQUESTS</code>, <code className="bg-[#FAF2EB] text-[#C86446] px-1 rounded">USERS</code>, <code className="bg-[#FAF2EB] text-[#C86446] px-1 rounded">CATEGORIES</code>, and <code className="bg-[#FAF2EB] text-[#C86446] px-1 rounded">PRIORITY</code> for Ananya Rao.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveQuery(presentation2Query);
              handleExecute(presentation2Query);
            }}
            className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Presentation-II Query</span>
          </button>
        </div>
      </div>

      {/* SQL Editor & Samples */}
      <div className="warm-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#F5F1EB] text-[#5C5247]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#2A2521]">
                Interactive Live MySQL Query Console
              </h3>
              <p className="text-[10px] text-[#8C8276]">
                Targeting database: <span className="font-mono text-[#C86446]">campus_facility_management</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveQuery('')}
              className="p-1.5 rounded-lg text-[#8E8376] hover:text-[#2A2521] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              title="Clear editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleExecute()}
              disabled={isRunning || !activeQuery.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running Query...' : 'Execute SQL'}</span>
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <span className="text-[10px] uppercase font-bold text-[#91877A] tracking-wider block mb-1.5">
            Quick Query Presets (PBL Demonstration)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveQuery(q.sql);
                  handleExecute(q.sql);
                }}
                className="px-2.5 py-1 rounded-md bg-[#FAF8F5] hover:bg-[#F3ECE2] border border-[#E4DDD2] text-[11px] text-[#5A5044] transition-colors cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="relative">
          <textarea
            rows={8}
            value={activeQuery}
            onChange={(e) => setActiveQuery(e.target.value)}
            placeholder="Write any SQL query (e.g. SELECT * FROM REQUESTS;)"
            className="w-full font-mono text-xs bg-[#FAF8F5] text-[#2A2521] p-3.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#C86446] focus:ring-1 focus:ring-[#C86446] leading-relaxed resize-y"
          />
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>
              <div className="font-semibold">MySQL Execution Error:</div>
              <div className="font-mono text-[11px] mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Query Output Table */}
        {result && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-[#7C7367]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2C6645]" />
                <span className="font-semibold text-[#2A2521]">Query Succeeded:</span>
                <span>{result.rowCount} row{result.rowCount !== 1 ? 's' : ''} returned</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#8E8376]">
                <Clock className="w-3 h-3" />
                <span>{result.executionTimeMs} ms</span>
              </div>
            </div>

            <div className="border border-[#EAE5DC] rounded-xl overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF8F5] text-[#7C7367] text-[10px] font-semibold border-b border-[#EAE5DC] uppercase tracking-wider sticky top-0">
                  <tr>
                    {result.columns.map((col: string) => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE5DC]">
                  {result.rows.length === 0 ? (
                    <tr>
                      <td colSpan={result.columns.length} className="py-8 text-center text-[#91877A]">
                        Query returned 0 matching rows.
                      </td>
                    </tr>
                  ) : (
                    result.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-[#FAF8F5] transition-colors">
                        {result.columns.map((col: string) => (
                          <td key={col} className="py-2.5 px-3 text-[#2A2521] whitespace-nowrap font-mono text-[11px]">
                            {row[col] === null ? (
                              <span className="text-[#A89F94] italic">NULL</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
