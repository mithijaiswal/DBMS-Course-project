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
  Pencil,
  Trash2,
  DoorOpen,
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

  // Modal States
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [showEditBuildingModal, setShowEditBuildingModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);

  // Active items being edited
  const [editingBuilding, setEditingBuilding] = useState<any>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  // Form States - Building
  const [buildingName, setBuildingName] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [buildingAddress, setBuildingAddress] = useState('');

  // Form States - Room
  const [targetBuildingId, setTargetBuildingId] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState('');
  const [floorLevel, setFloorLevel] = useState('1');

  // Form States - Asset
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Electrical');
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('Working');
  const [purchaseDate, setPurchaseDate] = useState('');

  // Common submission & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'building' | 'room' | 'asset';
    id: number;
    name: string;
    details?: string;
  } | null>(null);

  // Collect all rooms across buildings for modal dropdowns
  const allRooms = buildings.flatMap((b) =>
    (b.ROOMS || []).map((r: any) => ({
      ...r,
      buildingName: b.Name,
    }))
  );

  // --- Handlers for Buildings ---
  const openAddBuildingModal = () => {
    setBuildingName('');
    setCampusLocation('North Campus');
    setBuildingAddress('');
    setError('');
    setShowAddBuildingModal(true);
  };

  const openEditBuildingModal = (b: any) => {
    setEditingBuilding(b);
    setBuildingName(b.Name || '');
    setCampusLocation(b.CampusLocation || '');
    setBuildingAddress(b.Address || '');
    setError('');
    setShowEditBuildingModal(true);
  };

  const handleAddBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingName.trim() || !campusLocation.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/infrastructure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'building',
          Name: buildingName.trim(),
          CampusLocation: campusLocation.trim(),
          Address: buildingAddress.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add building');
      }

      setShowAddBuildingModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error creating building');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding || !buildingName.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/infrastructure', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'building',
          BuildingID: editingBuilding.BuildingID,
          Name: buildingName.trim(),
          CampusLocation: campusLocation.trim(),
          Address: buildingAddress.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update building');
      }

      setShowEditBuildingModal(false);
      setEditingBuilding(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error updating building');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers for Rooms ---
  const openAddRoomModal = (defaultBuildingId?: number) => {
    setTargetBuildingId(defaultBuildingId ? String(defaultBuildingId) : buildings[0]?.BuildingID ? String(buildings[0].BuildingID) : '');
    setRoomNumber('');
    setFloorLevel('1');
    setError('');
    setShowAddRoomModal(true);
  };

  const openEditRoomModal = (r: any, buildingId: number) => {
    setEditingRoom(r);
    setTargetBuildingId(String(r.BuildingID || buildingId));
    setRoomNumber(r.RoomNumber || '');
    setFloorLevel(String(r.FloorLevel ?? 1));
    setError('');
    setShowEditRoomModal(true);
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBuildingId || !roomNumber.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/infrastructure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'room',
          BuildingID: Number(targetBuildingId),
          RoomNumber: roomNumber.trim(),
          FloorLevel: parseInt(floorLevel, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add room');
      }

      setShowAddRoomModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error creating room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !roomNumber.trim() || !targetBuildingId) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/infrastructure', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'room',
          RoomID: editingRoom.RoomID,
          BuildingID: Number(targetBuildingId),
          RoomNumber: roomNumber.trim(),
          FloorLevel: parseInt(floorLevel, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update room');
      }

      setShowEditRoomModal(false);
      setEditingRoom(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error updating room');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers for Assets ---
  const openAddAssetModal = () => {
    setAssetName('');
    setAssetType('Electrical');
    setRoomId(allRooms[0]?.RoomID ? String(allRooms[0].RoomID) : '');
    setStatus('Working');
    setPurchaseDate('');
    setError('');
    setShowAddAssetModal(true);
  };

  const openEditAssetModal = (a: any) => {
    setEditingAsset(a);
    setAssetName(a.AssetName || '');
    setAssetType(a.Type || 'Electrical');
    setRoomId(a.RoomID ? String(a.RoomID) : '');
    setStatus(a.Status || 'Working');
    setPurchaseDate(a.PurchaseDate ? new Date(a.PurchaseDate).toISOString().split('T')[0] : '');
    setError('');
    setShowEditAssetModal(true);
  };

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
          PurchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : undefined,
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

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !assetName.trim() || !roomId) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/infrastructure', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'asset',
          AssetID: editingAsset.AssetID,
          RoomID: Number(roomId),
          AssetName: assetName.trim(),
          Type: assetType,
          Status: status,
          PurchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update asset');
      }

      setShowEditAssetModal(false);
      setEditingAsset(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error updating asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handler ---
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(
        `/api/infrastructure?type=${deleteConfirm.type}&id=${deleteConfirm.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to delete ${deleteConfirm.type}`);
      }

      setDeleteConfirm(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || `Error deleting ${deleteConfirm.type}`);
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
            Campus facilities, departments, assigned rooms, and registered equipment inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          {activeSubTab === 'buildings' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={openAddBuildingModal}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#C86446] text-[#2A2521] hover:text-[#C86446] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C86446]" />
                <span>Add Building</span>
              </button>
              <button
                onClick={() => openAddRoomModal()}
                className="px-3 py-1.5 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openAddAssetModal}
              className="px-3 py-1.5 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Buildings & Rooms Tab */}
      {activeSubTab === 'buildings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b) => {
            const rooms = b.ROOMS || [];
            const totalAssets = rooms.flatMap((r: any) => r.ASSETS || []).length;
            const totalTickets = rooms.flatMap((r: any) => r.REQUESTS || []).length;

            return (
              <div
                key={b.BuildingID}
                className="warm-card p-4 space-y-3 flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FDF3EF] text-[#C86446] flex items-center justify-center font-bold text-xs">
                        #{b.BuildingID}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#FAF8F5] text-[#7C7367] border border-[#EAE5DC]">
                        {b.CampusLocation}
                      </span>
                    </div>

                    {/* Building Edit & Delete Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditBuildingModal(b)}
                        className="p-1.5 rounded-md text-[#8C8276] hover:text-[#2A2521] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                        title="Edit Building"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'building',
                            id: b.BuildingID,
                            name: b.Name,
                            details: `This will permanently remove "${b.Name}" along with its ${rooms.length} rooms and associated equipment.`,
                          })
                        }
                        className="p-1.5 rounded-md text-[#8C8276] hover:text-[#B43834] hover:bg-[#FDF1F0] transition-colors cursor-pointer"
                        title="Delete Building"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-[#2A2521]">{b.Name}</h3>
                  <p className="text-[11px] text-[#7C7367] mt-0.5">{b.Address || 'No campus address specified'}</p>
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

                  {/* Rooms List Header with Add Button */}
                  <div className="pt-2 border-t border-[#F0EBE3]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-[#4A433A]">
                        Rooms ({rooms.length})
                      </span>
                      <button
                        onClick={() => openAddRoomModal(b.BuildingID)}
                        className="text-[10px] font-semibold text-[#C86446] hover:text-[#B25538] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Room</span>
                      </button>
                    </div>

                    {rooms.length === 0 ? (
                      <div className="text-[11px] text-[#9E9589] italic py-1">
                        No rooms configured yet
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {rooms.map((r: any) => {
                          const roomAssetCount = r.ASSETS?.length || 0;
                          return (
                            <div
                              key={r.RoomID}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#D6CEC2] transition-colors"
                            >
                              <div className="flex items-center gap-1.5">
                                <DoorOpen className="w-3.5 h-3.5 text-[#8C8276]" />
                                <span className="font-semibold text-[#2A2521] text-[11px]">
                                  {r.RoomNumber}
                                </span>
                                <span className="text-[10px] text-[#8C8276]">
                                  • Fl {r.FloorLevel}
                                </span>
                                {roomAssetCount > 0 && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#C86446] border border-[#F3CABE] font-medium">
                                    {roomAssetCount} assets
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => openEditRoomModal(r, b.BuildingID)}
                                  className="p-1 rounded text-[#8C8276] hover:text-[#2A2521] hover:bg-white transition-colors cursor-pointer"
                                  title="Edit Room"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'room',
                                      id: r.RoomID,
                                      name: `Room ${r.RoomNumber} (${b.Name})`,
                                      details: `This will permanently delete Room ${r.RoomNumber} and its associated asset and complaint records.`,
                                    })
                                  }
                                  className="p-1 rounded text-[#8C8276] hover:text-[#B43834] hover:bg-[#FDF1F0] transition-colors cursor-pointer"
                                  title="Delete Room"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assets Registry Tab */}
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
                <th className="py-3 px-4">Condition Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditAssetModal(a)}
                          className="p-1.5 rounded-md text-[#8C8276] hover:text-[#2A2521] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                          title="Edit Asset"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'asset',
                              id: a.AssetID,
                              name: a.AssetName,
                              details: `Room ${a.ROOMS?.RoomNumber || 'N/A'} (${a.ROOMS?.BUILDINGS?.Name || ''})`,
                            })
                          }
                          className="p-1.5 rounded-md text-[#8C8276] hover:text-[#B43834] hover:bg-[#FDF1F0] transition-colors cursor-pointer"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL: Add Building --- */}
      {showAddBuildingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">Add New Campus Building</h3>
              <button
                onClick={() => setShowAddBuildingModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBuilding} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Building Name</label>
                <input
                  type="text"
                  required
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder="e.g. Ramanujan Math Complex"
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Campus Location</label>
                <input
                  type="text"
                  required
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  placeholder="e.g. North Campus, Sector 4"
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={buildingAddress}
                  onChange={(e) => setBuildingAddress(e.target.value)}
                  placeholder="e.g. Near Central Library"
                  className="w-full warm-input"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowAddBuildingModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Edit Building --- */}
      {showEditBuildingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">Edit Building #{editingBuilding?.BuildingID}</h3>
              <button
                onClick={() => setShowEditBuildingModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditBuilding} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Building Name</label>
                <input
                  type="text"
                  required
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Campus Location</label>
                <input
                  type="text"
                  required
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={buildingAddress}
                  onChange={(e) => setBuildingAddress(e.target.value)}
                  className="w-full warm-input"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowEditBuildingModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add Room --- */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">Add New Room</h3>
              <button
                onClick={() => setShowAddRoomModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Building</label>
                <select
                  value={targetBuildingId}
                  onChange={(e) => setTargetBuildingId(e.target.value)}
                  required
                  className="w-full warm-input"
                >
                  <option value="">Select Building...</option>
                  {buildings.map((b) => (
                    <option key={b.BuildingID} value={b.BuildingID}>
                      {b.Name} ({b.CampusLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Room Number / Identifier</label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 101, Lab-2, Conf-A"
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Floor Level</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={50}
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(e.target.value)}
                  className="w-full warm-input"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Edit Room --- */}
      {showEditRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">Edit Room #{editingRoom?.RoomID}</h3>
              <button
                onClick={() => setShowEditRoomModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditRoom} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Building</label>
                <select
                  value={targetBuildingId}
                  onChange={(e) => setTargetBuildingId(e.target.value)}
                  required
                  className="w-full warm-input"
                >
                  {buildings.map((b) => (
                    <option key={b.BuildingID} value={b.BuildingID}>
                      {b.Name} ({b.CampusLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Floor Level</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={50}
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(e.target.value)}
                  className="w-full warm-input"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowEditRoomModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add Asset --- */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">Register Campus Asset</h3>
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
                <label className="block font-medium text-[#4A433A] mb-1">Equipment Type / Category</label>
                <input
                  type="text"
                  required
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  placeholder="e.g. Electrical, Audio-Visual, Furniture"
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
                      Room {r.RoomNumber} — {r.buildingName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#4A433A] mb-1">Condition Status</label>
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
                <div>
                  <label className="block font-medium text-[#4A433A] mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full warm-input"
                  />
                </div>
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

      {/* --- MODAL: Edit Asset --- */}
      {showEditAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">Edit Asset #{editingAsset?.AssetID}</h3>
              <button
                onClick={() => setShowEditAssetModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditAsset} className="p-6 space-y-4 text-xs">
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
                  className="w-full warm-input"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Equipment Type / Category</label>
                <input
                  type="text"
                  required
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
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
                  {allRooms.map((r) => (
                    <option key={r.RoomID} value={r.RoomID}>
                      Room {r.RoomNumber} — {r.buildingName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#4A433A] mb-1">Condition Status</label>
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
                <div>
                  <label className="block font-medium text-[#4A433A] mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full warm-input"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowEditAssetModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Delete Confirmation --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FDF1F0] text-[#B43834] flex items-center justify-center mx-auto border border-[#F8CBC9]">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-base text-[#2A2521]">
                  Delete {deleteConfirm.type === 'building' ? 'Building' : deleteConfirm.type === 'room' ? 'Room' : 'Asset'}?
                </h3>
                <p className="text-xs text-[#7C7367] mt-1.5 font-medium">
                  Are you sure you want to delete <span className="text-[#2A2521] font-bold">"{deleteConfirm.name}"</span>?
                </p>
                {deleteConfirm.details && (
                  <p className="text-[11px] text-[#B43834] mt-2 bg-[#FDF1F0] p-2 rounded-lg border border-[#F8CBC9]">
                    {deleteConfirm.details}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-xs font-semibold text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#B43834] hover:bg-[#962B28] text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
