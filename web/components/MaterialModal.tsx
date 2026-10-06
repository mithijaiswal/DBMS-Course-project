'use client';

import React, { useState } from 'react';
import { X, Package, AlertCircle, IndianRupee } from 'lucide-react';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  materials: any[];
  onSuccess: () => void;
}

export function MaterialModal({
  isOpen,
  onClose,
  request,
  materials,
  onSuccess,
}: MaterialModalProps) {
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !request) return null;

  const selectedMaterial = materials.find((m) => String(m.MaterialID) === materialId);
  const calculatedCost =
    selectedMaterial && quantity ? Number(selectedMaterial.UnitCost) * parseInt(quantity, 10) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || !quantity) {
      setErrorMessage('Please select a material and enter quantity');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Quantity must be greater than 0');
      return;
    }

    if (selectedMaterial && selectedMaterial.QuantityInStock < qty) {
      setErrorMessage(
        `Insufficient stock: only ${selectedMaterial.QuantityInStock} items available.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch(`/api/requests/${request.RequestID}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MaterialID: Number(materialId),
          QuantityUsed: qty,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to allocate material');
      }

      onSuccess();
      onClose();
      setMaterialId('');
      setQuantity('1');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error adding material');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FDF3EF] text-[#C86446] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#2A2521]">
                Allocate Spare Parts / Material
              </h3>
              <p className="text-[11px] text-[#7E7468]">
                Updates `MATERIALS`, `REQUEST_MATERIALS` & `COST`
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#948A7D] hover:text-[#2A2521] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#FDF1F0] border border-[#F8CBC9] text-[#B43834] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#4A433A] mb-1">
              Select Inventory Item <span className="text-[#C86446]">*</span>
            </label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              required
              className="w-full warm-input"
            >
              <option value="">Select Material...</option>
              {materials.map((m) => (
                <option key={m.MaterialID} value={m.MaterialID}>
                  {m.MaterialName} — ₹{Number(m.UnitCost).toFixed(2)} (Stock: {m.QuantityInStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#4A433A] mb-1">
              Quantity Used <span className="text-[#C86446]">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedMaterial ? selectedMaterial.QuantityInStock : 100}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full warm-input"
            />
          </div>

          {selectedMaterial && (
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1.5">
              <div className="flex justify-between text-[#7E7468]">
                <span>Unit Cost:</span>
                <span className="font-semibold text-[#2A2521]">₹{Number(selectedMaterial.UnitCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#7E7468]">
                <span>Available Stock:</span>
                <span className="font-semibold text-[#2A2521]">{selectedMaterial.QuantityInStock} units</span>
              </div>
              <div className="border-t border-[#EAE5DC] pt-1.5 flex justify-between font-semibold text-[#2A2521]">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-[#C86446]" />
                  Total Incurred Cost:
                </span>
                <span className="text-[#C86446] text-sm">₹{calculatedCost.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] text-[#7C7367]">
            <strong>ACID Transaction Awareness:</strong> Stock count is atomically decremented in <code className="text-[#C86446]">MATERIALS</code>, linked into <code className="text-[#C86446]">REQUEST_MATERIALS</code>, and the computed expenditure is recorded into <code className="text-[#C86446]">COST</code>.
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#F0EBE3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#EAE5DC] text-[#695F52] hover:bg-[#F7F4EE] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !materialId}
              className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Allocating...' : 'Allocate & Deduct Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
