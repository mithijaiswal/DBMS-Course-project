'use client';

import React from 'react';
import {
  Database,
  CheckCircle2,
  Key,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SchemaViewProps {
  tableCounts: Record<string, number>;
}

export function SchemaView({ tableCounts }: SchemaViewProps) {
  const tables = [
    {
      name: 'BUILDINGS',
      pk: 'BuildingID',
      fks: [],
      cols: ['BuildingID (PK)', 'Name', 'Address', 'CampusLocation'],
      desc: 'Stores physical campus blocks and geographical locations.',
    },
    {
      name: 'ROOMS',
      pk: 'RoomID',
      fks: ['BuildingID → BUILDINGS(BuildingID)'],
      cols: ['RoomID (PK)', 'BuildingID (FK)', 'RoomNumber', 'FloorLevel'],
      desc: 'Specific rooms located within campus buildings.',
    },
    {
      name: 'USERS',
      pk: 'UserID',
      fks: [],
      cols: ['UserID (PK)', 'FirstName', 'LastName', 'Email (UNIQUE)', 'PhoneNumber', 'UserRole'],
      desc: 'Students, faculty, and administrative staff reporting issues.',
    },
    {
      name: 'CATEGORIES',
      pk: 'CategoryID',
      fks: [],
      cols: ['CategoryID (PK)', 'CategoryName (UNIQUE)'],
      desc: 'Classification of maintenance complaints (Electrical, Plumbing, HVAC, etc.).',
    },
    {
      name: 'PRIORITY',
      pk: 'PriorityID',
      fks: [],
      cols: ['PriorityID (PK)', 'LevelName (UNIQUE)', 'ResponseTime'],
      desc: 'SLA priority tier with specified target resolution time.',
    },
    {
      name: 'ASSETS',
      pk: 'AssetID',
      fks: ['RoomID → ROOMS(RoomID)'],
      cols: ['AssetID (PK)', 'RoomID (FK)', 'AssetName', 'Type', 'PurchaseDate', 'Status'],
      desc: 'Physical fixtures, electronics, and appliances installed in rooms.',
    },
    {
      name: 'TECHNICIANS',
      pk: 'TechnicianID',
      fks: [],
      cols: ['TechnicianID (PK)', 'FirstName', 'LastName', 'Specialization', 'AvailabilityStatus'],
      desc: 'Campus maintenance technicians, skill domains, and active status.',
    },
    {
      name: 'REQUESTS',
      pk: 'RequestID',
      fks: [
        'UserID → USERS(UserID)',
        'RoomID → ROOMS(RoomID)',
        'CategoryID → CATEGORIES(CategoryID)',
        'PriorityID → PRIORITY(PriorityID)',
      ],
      cols: [
        'RequestID (PK)',
        'UserID (FK)',
        'RoomID (FK)',
        'CategoryID (FK)',
        'PriorityID (FK)',
        'Description',
        'DateSubmitted',
        'CurrentStatus',
      ],
      desc: 'Core complaint tickets logged across campus.',
    },
    {
      name: 'ASSIGNMENT',
      pk: 'AssignmentID',
      fks: [
        'RequestID → REQUESTS(RequestID)',
        'TechnicianID → TECHNICIANS(TechnicianID)',
      ],
      cols: ['AssignmentID (PK)', 'RequestID (FK)', 'TechnicianID (FK)', 'AssignmentDate', 'CompletionDate'],
      desc: 'Dispatches technician to ticket with assignment and closure dates.',
    },
    {
      name: 'WORK_LOG',
      pk: 'LogID',
      fks: ['AssignmentID → ASSIGNMENT(AssignmentID)'],
      cols: ['LogID (PK)', 'AssignmentID (FK)', 'LogEntryDate', 'Description', 'HoursSpent'],
      desc: 'Granular labor hours spent by technician executing repair.',
    },
    {
      name: 'MATERIALS',
      pk: 'MaterialID',
      fks: [],
      cols: ['MaterialID (PK)', 'MaterialName', 'UnitCost', 'QuantityInStock'],
      desc: 'Master supply inventory, unit pricing, and warehouse balance.',
    },
    {
      name: 'REQUEST_MATERIALS',
      pk: '(RequestID, MaterialID)',
      fks: [
        'RequestID → REQUESTS(RequestID)',
        'MaterialID → MATERIALS(MaterialID)',
      ],
      cols: ['RequestID (PK, FK)', 'MaterialID (PK, FK)', 'QuantityUsed'],
      desc: 'Many-to-many bill of materials consumed for a maintenance ticket.',
    },
    {
      name: 'COST',
      pk: 'CostID',
      fks: ['RequestID → REQUESTS(RequestID)'],
      cols: ['CostID (PK)', 'RequestID (FK)', 'CostType', 'Amount', 'IncurredDate'],
      desc: 'Itemized expenditure accounting for materials and services.',
    },
    {
      name: 'FEEDBACK',
      pk: 'FeedbackID',
      fks: ['RequestID → REQUESTS(RequestID)'],
      cols: ['FeedbackID (PK)', 'RequestID (FK)', 'Rating (1-5)', 'Comments', 'SubmissionDate'],
      desc: 'User rating and review upon service resolution.',
    },
    {
      name: 'STATUS_HISTORY',
      pk: 'StatusLogID',
      fks: ['RequestID → REQUESTS(RequestID)'],
      cols: ['StatusLogID (PK)', 'RequestID (FK)', 'StatusChangeDate', 'PreviousStatus', 'NewStatus'],
      desc: 'Chronological audit trail tracking all lifecycle status changes.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 3NF Normalization Theory Card */}
      <div className="warm-card p-6 bg-gradient-to-r from-[#FAF8F5] via-white to-[#FDF3EF] border-l-4 border-l-[#C86446]">
        <h2 className="text-base font-bold text-[#2A2521] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C86446]" />
          Relational Schema & 3NF Normalization Analysis
        </h2>
        <p className="text-xs text-[#7C7367] mt-1 leading-relaxed">
          The database schema is fully normalized up to <strong>Third Normal Form (3NF)</strong> to eliminate data redundancy, prevent insertion/update/deletion anomalies, and guarantee referential integrity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#EAE5DC] text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-[#EAE5DC] space-y-1">
            <div className="font-bold text-[#C86446] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>1st Normal Form (1NF)</span>
            </div>
            <p className="text-[11px] text-[#7C7367]">
              All attributes contain atomic (indivisible) values. No repeating groups or multivalued attributes. Composite request materials are decomposed into the associative entity <code className="text-[#C86446]">REQUEST_MATERIALS</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#EAE5DC] space-y-1">
            <div className="font-bold text-[#C86446] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>2nd Normal Form (2NF)</span>
            </div>
            <p className="text-[11px] text-[#7C7367]">
              Every non-prime attribute is fully functionally dependent on the entire primary key. In <code className="text-[#C86446]">REQUEST_MATERIALS</code> (Key: RequestID + MaterialID), <code className="text-[#2A2521]">QuantityUsed</code> depends on both. Material properties (UnitCost, Name) are isolated in <code className="text-[#C86446]">MATERIALS</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#EAE5DC] space-y-1">
            <div className="font-bold text-[#C86446] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>3rd Normal Form (3NF)</span>
            </div>
            <p className="text-[11px] text-[#7C7367]">
              No transitive dependencies (X → Y → Z). Room location details are decomposed into <code className="text-[#C86446]">BUILDINGS</code> (Room → BuildingID → BuildingName). Technicians, categories, and priorities are all isolated in dedicated relation tables.
            </p>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((t) => {
          const count = tableCounts[t.name] ?? '-';

          return (
            <div key={t.name} className="warm-card p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-xs font-mono text-[#C86446] bg-[#FDF3EF] px-2 py-0.5 rounded border border-[#F3CABE]">
                    {t.name}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#EDF5F0] text-[#2C6645] border border-[#C8E3D2]">
                    {count} records
                  </span>
                </div>

                <p className="text-[11px] text-[#7C7367] mt-1">
                  {t.desc}
                </p>

                <div className="mt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#91877A] tracking-wider block">
                    Columns:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {t.cols.map((c, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          c.includes('(PK')
                            ? 'bg-[#FEF7E9] text-[#966512] font-semibold border border-[#F7DFB3]'
                            : c.includes('(FK')
                            ? 'bg-[#EFF4FA] text-[#275685] border border-[#CDE0F3]'
                            : 'bg-[#FAF8F5] text-[#554C41] border border-[#EAE5DC]'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {t.fks.length > 0 && (
                <div className="pt-2 border-t border-[#EAE5DC] text-[10px] text-[#7C7367] space-y-0.5">
                  <span className="font-semibold text-[#4A433A] block">Foreign Key Constraints:</span>
                  {t.fks.map((fk, idx) => (
                    <div key={idx} className="font-mono text-[9px] text-[#5C5247] truncate">
                      ↳ {fk}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
