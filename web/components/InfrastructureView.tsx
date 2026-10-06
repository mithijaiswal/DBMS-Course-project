'use client';

import React, { useState } from 'react';
import {
  Building2,
  Layers,
  Plus,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  X,
  AlertCircle,
} from 'lucide-react';

interface InfrastructureViewProps {
  buildings: any[];
  assets: any[];
  onRefresh: () => void;
}

export function InfrastructureView({
  buildings,
  assets,
  onRefresh,
}: InfrastructureViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'buildings' | 'assets'>('buildings');
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Electrical');
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('Working');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Collect all rooms across buildings for modal dropdown
  const allRooms = buildings.flatMap((b) =>
    (b.ROOMS || []).map((r: any) => ({
      ...r,
      buildingName: b.Name,
    }))
  );

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !roomId) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/infrastructure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'asset',
          RoomID: Number(roomId),
          AssetName: assetName.trim(),
          Type: assetType,
          Status: status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add asset');
      }

      setShowAddAssetModal(false);
      setAssetName('');
      setRoomId('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error creating asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="warm-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#2A2521] flex items-center gap-2">
            Campus Infrastructure & Fixed Asset Management
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C86446] border border-[#F3CABE]">
              {buildings.length} Blocks • {assets.length} Assets
            </span>
          </h2>
          <p className="text-xs text-[#7C7367] mt-1">
            Hierarchical mapping: <code className="text-[#C86446]">BUILDINGS</code> → <code className="text-[#C86446]">ROOMS</code> → <code className="text-[#C86446]">ASSETS</code> & <code className="text-[#C86446]">REQUESTS</code>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sub-tab pills */}
          <div className="p-1 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('buildings')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'buildings'
                  ? 'bg-white text-[#C86446] shadow-2xs'
                  : 'text-[#7C7367] hover:text-[#2A2521]'
              }`}
            >
              Buildings & Rooms
            </button>
            <button
              onClick={() => setActiveSubTab('assets')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'assets'
                  ? 'bg-white text-[#C86446] shadow-2xs'
                  : 'text-[#7C7367] hover:text-[#2A2521]'
              }`}
            >
              Assets Registry
            </button>
          </div>

          <button
            onClick={() => setShowAddAssetModal(true)}
            className="px-3 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Buildings Tab */}
      {activeSubTab === 'buildings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b) => {
            const rooms = b.ROOMS || [];
            const totalAssets = rooms.flatMap((r: any) => r.ASSETS || []).length;
            const totalTickets = rooms.flatMap((r: any) => r.REQUESTS || []).length;

            return (
              <div
                key={b.BuildingID}
                className="warm-card p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FDF3EF] text-[#C86446] flex items-center justify-center font-bold text-xs">
                      #{b.BuildingID}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#FAF8F5] text-[#7C7367] border border-[#EAE5DC]">
                      {b.CampusLocation}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#2A2521]">
                    {b.Name}
                  </h3>
                  <p className="text-[11px] text-[#7C7367] mt-0.5">
                    {b.Address}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE5DC] space-y-2 text-xs">
                  <div className="flex justify-between text-[#685E53]">
                    <span>Configured Rooms:</span>
                    <strong className="text-[#2A2521]">{rooms.length} rooms</strong>
                  </div>
                  <div className="flex justify-between text-[#685E53]">
                    <span>Registered Assets:</span>
                    <strong className="text-[#2A2521]">{totalAssets} assets</strong>
                  </div>
                  <div className="flex justify-between text-[#685E53]">
                    <span>Lifetime Complaints:</span>
                    <strong className="text-[#C86446]">{totalTickets} tickets</strong>
                  </div>

                  <div className="pt-1 flex flex-wrap gap-1">
                    {rooms.map((r: any) => (
                      <span
                        key={r.RoomID}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#FAF8F5] text-[#554C41] border border-[#EAE5DC]"
                      >
                        {r.RoomNumber} (Fl {r.FloorLevel})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assets Tab */}
      {activeSubTab === 'assets' && (
        <div className="warm-card overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F5F0] text-[#746C63] text-[11px] font-semibold border-b border-[#EAE5DC] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Category / Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4 text-right">Condition Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5DC]">
              {assets.map((a) => {
                const isWorking = a.Status === 'Working';

                return (
                  <tr key={a.AssetID} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#2A2521]">
                      #{a.AssetID}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2A2521]">
                      {a.AssetName}
                    </td>
                    <td className="py-3 px-4 text-[#665C50]">
                      <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#554C41] border border-[#EAE5DC] text-[10px] font-medium">
                        {a.Type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#2A2521]">
                        Room {a.ROOMS?.RoomNumber}
                      </div>
                      <div className="text-[10px] text-[#8C8276]">
                        {a.ROOMS?.BUILDINGS?.Name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#8C8276]">
                      {a.PurchaseDate
                        ? new Date(a.PurchaseDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isWorking
                            ? 'bg-[#EDF5F0] text-[#2C6645] border-[#C8E3D2]'
                            : 'bg-[#FDF1F0] text-[#B43834] border-[#F8CBC9]'
                        }`}
                      >
                        {isWorking ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{a.Status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">
                Register Campus Asset
              </h3>
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. 75-inch Interactive Smart Display"
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Equipment Type</label>
                <input
                  type="text"
                  required
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  placeholder="e.g. Electronic / Audio-Visual"
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Installed Room</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                  className="w-full warm-input"
                >
                  <option value="">Select Room...</option>
                  {allRooms.map((r) => (
                    <option key={r.RoomID} value={r.RoomID}>
                      {r.RoomNumber} — {r.buildingName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Operational Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full warm-input"
                >
                  <option value="Working">Working</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
