'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';

interface InventoryViewProps {
  materials: any[];
  onRefresh: () => void;
}

export function InventoryView({ materials, onRefresh }: InventoryViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [restockAmount, setRestockAmount] = useState('20');

  // Add form states
  const [name, setName] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !restockAmount) return;

    try {
      setIsSubmitting(true);
      await fetch('/api/materials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MaterialID: selectedMaterial.MaterialID,
          AddQuantity: parseInt(restockAmount, 10),
        }),
      });

      setShowRestockModal(false);
      setSelectedMaterial(null);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitCost || !initialStock) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MaterialName: name.trim(),
          UnitCost: parseFloat(unitCost),
          QuantityInStock: parseInt(initialStock, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add material');
      }

      setShowAddModal(false);
      setName('');
      setUnitCost('');
      setInitialStock('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error adding material');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="warm-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#2A2521] flex items-center gap-2">
            Spare Parts & Materials Inventory Catalog
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#C86446] border border-[#F3CABE]">
              {materials.length} SKUs Listed
            </span>
          </h2>
          <p className="text-xs text-[#7C7367] mt-1">
            Real-time campus maintenance supply depot linked to MySQL <code className="bg-[#FAF2EB] text-[#C86446] px-1 rounded">MATERIALS</code> and <code className="bg-[#FAF2EB] text-[#C86446] px-1 rounded">REQUEST_MATERIALS</code>.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Material SKU</span>
        </button>
      </div>

      {/* Materials Table */}
      <div className="warm-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F7F5F0] text-[#746C63] text-[11px] font-semibold border-b border-[#EAE5DC] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">SKU / Item Name</th>
              <th className="py-3 px-4">Unit Cost</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4">Inventory Status</th>
              <th className="py-3 px-4">Allocated Usage</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE5DC]">
            {materials.map((m) => {
              const isLow = m.QuantityInStock < 40;
              const usageCount = m.REQUEST_MATERIALS?.length || 0;

              return (
                <tr key={m.MaterialID} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#2A2521] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF0EB] text-[#C86446] flex items-center justify-center font-bold text-[10px]">
                        #{m.MaterialID}
                      </div>
                      <span>{m.MaterialName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#2A2521]">
                    ₹{Number(m.UnitCost).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-sm text-[#2A2521]">
                      {m.QuantityInStock}
                    </span>
                    <span className="text-[10px] text-[#8C8276] ml-1">units in stock</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isLow
                          ? 'bg-[#FDF1F0] text-[#B43834] border-[#F8CBC9]'
                          : 'bg-[#EDF5F0] text-[#2C6645] border-[#C8E3D2]'
                      }`}
                    >
                      {isLow ? <AlertTriangle className="w-3 h-3" /> : null}
                      {isLow ? 'Low Stock Warning' : 'Healthy Inventory'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#695F52]">
                    Used in <strong>{usageCount}</strong> ticket{usageCount !== 1 ? 's' : ''}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedMaterial(m);
                        setShowRestockModal(true);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#FAF8F5] hover:bg-[#F0EAE0] border border-[#E2DBD0] text-[#554C41] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer inline-flex"
                    >
                      <RefreshCw className="w-3 h-3 text-[#C86446]" />
                      <span>Restock</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {showRestockModal && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">
                Restock {selectedMaterial.MaterialName}
              </h3>
              <button
                onClick={() => setShowRestockModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#4A433A] mb-1">
                  Units to Add to Current Stock ({selectedMaterial.QuantityInStock})
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full warm-input"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2A2521]">
                Add New Material SKU
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A433A] mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 100W Floodlight Fixture"
                  className="w-full warm-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#4A433A] mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="350.00"
                    className="w-full warm-input"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#4A433A] mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    placeholder="50"
                    className="w-full warm-input"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
