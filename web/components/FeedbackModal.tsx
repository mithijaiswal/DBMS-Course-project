'use client';

import React, { useState } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onSuccess: () => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await fetch(`/api/requests/${request.RequestID}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Rating: rating,
          Comments: comments.trim() || 'Service completed satisfactorily.',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      onSuccess();
      onClose();
      setRating(5);
      setComments('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error recording feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#EAE5DC] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE3] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEF7E9] text-[#966512] flex items-center justify-center">
              <Star className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#2A2521]">
                Service Feedback & Rating
              </h3>
              <p className="text-[11px] text-[#7E7468]">
                Rate the quality of service received
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
            <label className="block font-medium text-[#4A433A] mb-2 text-center">
              Rate Service Quality (1 - 5 Stars)
            </label>
            <div className="flex items-center justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1.5 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-[#F59E0B] text-[#F59E0B]'
                        : 'text-[#DDD7CE] fill-[#FAF8F5]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-xs font-semibold text-[#8B6B22]">
              {rating === 5 && 'Outstanding Resolution'}
              {rating === 4 && 'Good Service'}
              {rating === 3 && 'Average Quality'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Unsatisfactory'}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#4A433A] mb-1">
              Feedback Remarks / Comments
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe resolution quality, punctuality, technician helpfulness..."
              className="w-full warm-input resize-none"
            />
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#C86446] text-white hover:bg-[#B25538] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Save Feedback Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
