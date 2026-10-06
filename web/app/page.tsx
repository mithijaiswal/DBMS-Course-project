'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { OverviewCards } from '@/components/OverviewCards';
import { RequestsTable } from '@/components/RequestsTable';
import { RequestDetailModal } from '@/components/RequestDetailModal';
import { NewRequestModal } from '@/components/NewRequestModal';
import { AssignTechModal } from '@/components/AssignTechModal';
import { WorkLogModal } from '@/components/WorkLogModal';
import { MaterialModal } from '@/components/MaterialModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { AnalyticsView } from '@/components/AnalyticsView';
import { TechniciansView } from '@/components/TechniciansView';
import { InventoryView } from '@/components/InventoryView';
import { InfrastructureView } from '@/components/InfrastructureView';
import { SqlConsoleView } from '@/components/SqlConsoleView';
import { SchemaView } from '@/components/SchemaView';
import { AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('requests');

  // Data states
  const [requests, setRequests] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({
    users: [],
    buildings: [],
    rooms: [],
    categories: [],
    priorities: [],
    technicians: [],
    materials: [],
    assets: [],
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [totalDbRecords, setTotalDbRecords] = useState<number>(0);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isReseeding, setIsReseeding] = useState(false);

  // Toast / Banner alert
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [assignRequest, setAssignRequest] = useState<any>(null);
  const [workLogRequest, setWorkLogRequest] = useState<any>(null);
  const [materialRequest, setMaterialRequest] = useState<any>(null);
  const [feedbackRequest, setFeedbackRequest] = useState<any>(null);
  const [deleteConfirmRequest, setDeleteConfirmRequest] = useState<any>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/requests?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
        // If a request is currently selected in detail drawer, refresh it too
        if (selectedRequest) {
          const updated = json.data.find((r: any) => r.RequestID === selectedRequest.RequestID);
          if (updated) setSelectedRequest(updated);
        }
      }
    } catch (e) {
      console.error('Error loading requests:', e);
    }
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery, selectedRequest]);

  // Fetch Metadata
  const fetchMeta = async () => {
    try {
      const res = await fetch('/api/meta');
      const json = await res.json();
      if (json.success) {
        setMetadata(json.data);
      }
    } catch (e) {
      console.error('Error loading metadata:', e);
    }
  };

  // Fetch Analytics & Table Counts
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }

      // Query table counts for all 15 tables
      const countRes = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            SELECT 'BUILDINGS' t, count(*) c FROM BUILDINGS UNION ALL
            SELECT 'ROOMS', count(*) FROM ROOMS UNION ALL
            SELECT 'USERS', count(*) FROM USERS UNION ALL
            SELECT 'CATEGORIES', count(*) FROM CATEGORIES UNION ALL
            SELECT 'PRIORITY', count(*) FROM PRIORITY UNION ALL
            SELECT 'ASSETS', count(*) FROM ASSETS UNION ALL
            SELECT 'TECHNICIANS', count(*) FROM TECHNICIANS UNION ALL
            SELECT 'REQUESTS', count(*) FROM REQUESTS UNION ALL
            SELECT 'ASSIGNMENT', count(*) FROM ASSIGNMENT UNION ALL
            SELECT 'WORK_LOG', count(*) FROM WORK_LOG UNION ALL
            SELECT 'MATERIALS', count(*) FROM MATERIALS UNION ALL
            SELECT 'REQUEST_MATERIALS', count(*) FROM REQUEST_MATERIALS UNION ALL
            SELECT 'COST', count(*) FROM COST UNION ALL
            SELECT 'FEEDBACK', count(*) FROM FEEDBACK UNION ALL
            SELECT 'STATUS_HISTORY', count(*) FROM STATUS_HISTORY;
          `,
        }),
      });
      const countJson = await countRes.json();
      if (countJson.success && countJson.rows) {
        const counts: Record<string, number> = {};
        let total = 0;
        countJson.rows.forEach((r: any) => {
          const val = Number(r.c);
          counts[r.t] = val;
          total += val;
        });
        setTableCounts(counts);
        setTotalDbRecords(total);
      }
    } catch (e) {
      console.error('Error loading analytics:', e);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchRequests(), fetchMeta(), fetchAnalytics()]);
      setIsLoading(false);
    };
    init();
  }, []);

  // Re-fetch requests when search or filters change
  useEffect(() => {
    fetchRequests();
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Reseed / Reset Database
  const handleReseed = async () => {
    if (!confirm('Reset and re-seed database with Presentation-II baseline + extended campus records?')) {
      return;
    }

    try {
      setIsReseeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Database successfully re-seeded with presentation 2 data + extended dataset!');
        await Promise.all([fetchRequests(), fetchMeta(), fetchAnalytics()]);
      } else {
        showToast(json.error || 'Failed to reseed database', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error reseeding database', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  // Status Change Handler
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/requests/${selectedRequest.RequestID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CurrentStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Request #${selectedRequest.RequestID} transitioned to "${newStatus}"`);
        setSelectedRequest(data.data);
        await Promise.all([fetchRequests(), fetchAnalytics()]);
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error updating status', 'error');
    }
  };

  // Delete Request Handler (Cascading Cleanup)
  const handleDeleteRequest = async (requestId: number) => {
    try {
      const res = await fetch(`/api/requests?id=${requestId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Record #${requestId} and all relational child rows removed successfully from MySQL.`);
        setDeleteConfirmRequest(null);
        if (selectedRequest?.RequestID === requestId) {
          setSelectedRequest(null);
        }
        await Promise.all([fetchRequests(), fetchAnalytics()]);
      } else {
        showToast(data.error || 'Failed to delete request', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error deleting request', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-center space-x-3 text-xs font-medium ${
              toastMessage.type === 'success'
                ? 'bg-[#FFFFFF] border-[#C8E3D2] text-[#2C6645] ring-1 ring-[#C8E3D2]'
                : 'bg-[#FFFFFF] border-[#F8CBC9] text-[#B43834] ring-1 ring-[#F8CBC9]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2C6645] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#B43834] shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onReseed={handleReseed}
        isReseeding={isReseeding}
        dbStatus={{ ok: true, count: totalDbRecords }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* KPI Overview Cards */}
        {analytics?.kpis && (
          <OverviewCards
            kpis={analytics.kpis}
            onFilterStatus={(s) => {
              setActiveTab('requests');
              setStatusFilter(s);
            }}
          />
        )}

        {/* Tab 1: Requests Table */}
        {activeTab === 'requests' && (
          <RequestsTable
            requests={requests}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={metadata.categories}
            priorities={metadata.priorities}
            onSelectRequest={(r) => setSelectedRequest(r)}
            onAssignRequest={(r) => setAssignRequest(r)}
            onDeleteRequest={(r) => setDeleteConfirmRequest(r)}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Analytics & Reports */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            onRefresh={fetchAnalytics}
          />
        )}

        {/* Tab 3: Technicians Roster */}
        {activeTab === 'technicians' && (
          <TechniciansView
            technicians={metadata.technicians}
            onRefresh={async () => {
              await fetchMeta();
              await fetchAnalytics();
            }}
          />
        )}

        {/* Tab 4: Inventory & Materials */}
        {activeTab === 'inventory' && (
          <InventoryView
            materials={metadata.materials}
            onRefresh={async () => {
              await fetchMeta();
              await fetchAnalytics();
            }}
          />
        )}

        {/* Tab 5: Infrastructure & Assets */}
        {activeTab === 'infrastructure' && (
          <InfrastructureView
            buildings={metadata.buildings}
            assets={metadata.assets}
            onRefresh={async () => {
              await fetchMeta();
              await fetchAnalytics();
            }}
          />
        )}

        {/* Tab 6: Presentation-II SQL Console */}
        {activeTab === 'sql' && <SqlConsoleView />}

        {/* Tab 7: 3NF Relational Schema */}
        {activeTab === 'schema' && <SchemaView tableCounts={tableCounts} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE5DC] bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8276] gap-2">
          <div>
            Campus Facility Maintenance Request Management System • <strong>DBMS PBL Project #41</strong>
          </div>
          <div>
            Design & Implementation by <strong>Mithi Jaiswal (25WU0102158)</strong> & <strong>Soumya Purohit (25WU0102272)</strong> • Woxsen University
          </div>
        </div>
      </footer>

      {/* --- MODALS --- */}

      {/* 1. New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        users={metadata.users}
        rooms={metadata.rooms}
        categories={metadata.categories}
        priorities={metadata.priorities}
        onSuccess={async (newReq) => {
          showToast(`Request #${newReq.RequestID} logged successfully in MySQL!`);
          await Promise.all([fetchRequests(), fetchAnalytics()]);
        }}
      />

      {/* 2. Request Detail Modal */}
      <RequestDetailModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onAssignTech={() => setAssignRequest(selectedRequest)}
        onAddWorkLog={() => setWorkLogRequest(selectedRequest)}
        onAddMaterial={() => setMaterialRequest(selectedRequest)}
        onAddFeedback={() => setFeedbackRequest(selectedRequest)}
        onStatusChange={handleStatusChange}
        onDelete={() => setDeleteConfirmRequest(selectedRequest)}
      />

      {/* 3. Assign Technician Modal */}
      <AssignTechModal
        isOpen={!!assignRequest}
        onClose={() => setAssignRequest(null)}
        request={assignRequest}
        technicians={metadata.technicians}
        onSuccess={async () => {
          showToast('Technician assigned successfully!');
          await Promise.all([fetchRequests(), fetchMeta(), fetchAnalytics()]);
        }}
      />

      {/* 4. Work Log Modal */}
      <WorkLogModal
        isOpen={!!workLogRequest}
        onClose={() => setWorkLogRequest(null)}
        request={workLogRequest}
        onSuccess={async () => {
          showToast('Technician labor logged in WORK_LOG table!');
          await Promise.all([fetchRequests(), fetchAnalytics()]);
        }}
      />

      {/* 5. Material Modal */}
      <MaterialModal
        isOpen={!!materialRequest}
        onClose={() => setMaterialRequest(null)}
        request={materialRequest}
        materials={metadata.materials}
        onSuccess={async () => {
          showToast('Material allocated, stock decremented, and cost recorded!');
          await Promise.all([fetchRequests(), fetchMeta(), fetchAnalytics()]);
        }}
      />

      {/* 6. Feedback Modal */}
      <FeedbackModal
        isOpen={!!feedbackRequest}
        onClose={() => setFeedbackRequest(null)}
        request={feedbackRequest}
        onSuccess={async () => {
          showToast('Feedback and star rating submitted to FEEDBACK table!');
          await Promise.all([fetchRequests(), fetchAnalytics()]);
        }}
      />

      {/* 7. Delete Confirmation Dialog (Demonstrates Deletion of Records) */}
      {deleteConfirmRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#F8CBC9] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1F0] text-[#B43834] flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#2A2521]">
                Delete Request #{deleteConfirmRequest.RequestID}?
              </h3>
              <p className="text-xs text-[#7C7367] leading-relaxed">
                This operation will execute a cascading relational cleanup in MySQL, deleting associated records from <code className="text-[#B43834]">WORK_LOG</code>, <code className="text-[#B43834]">ASSIGNMENT</code>, <code className="text-[#B43834]">REQUEST_MATERIALS</code>, <code className="text-[#B43834]">COST</code>, <code className="text-[#B43834]">FEEDBACK</code>, and <code className="text-[#B43834]">STATUS_HISTORY</code> before removing the <code className="text-[#B43834]">REQUESTS</code> row.
              </p>
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-xs text-[#4A433A]">
                <strong>Complaint:</strong> {deleteConfirmRequest.Description}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#F0EBE3] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRequest(null)}
                className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-xs font-semibold text-[#695F52] hover:bg-[#F2ECE2] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRequest(deleteConfirmRequest.RequestID)}
                className="px-4 py-2 rounded-lg bg-[#B43834] text-white hover:bg-[#9B2A27] text-xs font-semibold transition-colors cursor-pointer"
              >
                Confirm Delete (Live MySQL)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
