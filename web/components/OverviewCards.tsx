'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Activity,
  Layers,
} from 'lucide-react';

interface OverviewCardsProps {
  kpis: {
    totalRequests: number;
    pendingCount: number;
    assignedCount: number;
    inProgressCount: number;
    completedCount: number;
    totalCost: number;
    totalHoursLogged: number;
    avgRating: string;
    feedbackCount: number;
  };
  onFilterStatus?: (status: string) => void;
}

export function OverviewCards({ kpis, onFilterStatus }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Requests',
      value: kpis.totalRequests,
      sub: 'All logged incidents',
      icon: Layers,
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#EAE5DC]',
      badgeBg: 'bg-[#F5F2EB]',
      badgeColor: 'text-[#6E6355]',
      onClick: () => onFilterStatus?.('all'),
    },
    {
      title: 'Pending Action',
      value: kpis.pendingCount,
      sub: 'Awaiting technician',
      icon: Clock,
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#EAE5DC]',
      badgeBg: 'bg-[#FEF7E9]',
      badgeColor: 'text-[#966512]',
      indicator: kpis.pendingCount > 0 ? 'bg-[#D97706]' : 'bg-[#10B981]',
      onClick: () => onFilterStatus?.('Pending'),
    },
    {
      title: 'In Progress / Assigned',
      value: kpis.assignedCount + kpis.inProgressCount,
      sub: `${kpis.assignedCount} assigned, ${kpis.inProgressCount} active work`,
      icon: Activity,
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#EAE5DC]',
      badgeBg: 'bg-[#EFF4FA]',
      badgeColor: 'text-[#275685]',
      onClick: () => onFilterStatus?.('In Progress'),
    },
    {
      title: 'Resolved Tickets',
      value: kpis.completedCount,
      sub: 'Repairs completed & closed',
      icon: CheckCircle2,
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#EAE5DC]',
      badgeBg: 'bg-[#EDF5F0]',
      badgeColor: 'text-[#2C6645]',
      onClick: () => onFilterStatus?.('Completed'),
    },
    {
      title: 'Facility Expenditure',
      value: `₹${Number(kpis.totalCost).toLocaleString('en-IN')}`,
      sub: 'Materials & spare costs',
      icon: IndianRupee,
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#EAE5DC]',
      badgeBg: 'bg-[#FDF3EF]',
      badgeColor: 'text-[#C86446]',
    },
    {
      title: 'Labor Hours Logged',
      value: `${kpis.totalHoursLogged} hrs`,
      sub: `Avg Feedback: ★ ${kpis.avgRating} / 5.0`,
      icon: AlertTriangle,
      bg: 'bg-[#FFFFFF]',
      border: 'border-[#EAE5DC]',
      badgeBg: 'bg-[#F5F1FA]',
      badgeColor: 'text-[#664391]',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={card.onClick}
            className={`p-3.5 rounded-xl border ${card.border} ${card.bg} shadow-xs hover:border-[#DFD7CA] hover:shadow-sm transition-all cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[#7C7469] group-hover:text-[#2A2521] transition-colors truncate">
                {card.title}
              </span>
              <div className={`p-1 rounded-md ${card.badgeBg} ${card.badgeColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-[#2A2521]">
                {card.value}
              </span>
              {card.indicator && (
                <span className={`w-2 h-2 rounded-full ${card.indicator}`} />
              )}
            </div>
            <div className="text-[10px] text-[#91877A] mt-1 truncate">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
