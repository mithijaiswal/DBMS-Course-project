'use client';

import React from 'react';
import {
  Wrench,
  Database,
  Plus,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewRequest: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewRequest,
}: NavbarProps) {
  const tabs = [
    { id: 'requests', label: 'Maintenance Requests', icon: Wrench },
    { id: 'analytics', label: 'Analytics & Reports', icon: Layers },
    { id: 'technicians', label: 'Technicians', icon: CheckCircle2 },
    { id: 'inventory', label: 'Inventory & Materials', icon: Database },
    { id: 'infrastructure', label: 'Campus Assets', icon: Layers },
  ];

  return (
    <header className="border-b border-[#EAE5DC] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-[#F4EFE6] text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0EB] border border-[#F3CABE] flex items-center justify-center text-[#C86446] font-bold text-sm shadow-xs">
              CF
            </div>
            <div>
              <div className="font-semibold text-[#2A2521] text-sm tracking-tight">
                Campus Facility Maintenance System
              </div>
              <div className="text-[#877E73] text-[11px]">
                Woxsen University • <span className="font-medium text-[#4A433A]">Mithi Jaiswal (25WU0102158)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Create Ticket */}
            <button
              onClick={onOpenNewRequest}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Maintenance Request</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 text-xs no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#FDF3EF] text-[#C86446] border border-[#F3CABE] shadow-2xs font-semibold'
                    : 'text-[#6E6458] hover:text-[#2A2521] hover:bg-[#F7F4EE]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C86446]' : 'text-[#9A9084]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
