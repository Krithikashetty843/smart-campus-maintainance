import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { useComplaints } from '../../context/ComplaintContext';

export default function FeedbackModal({ isOpen, onClose, complaint }) {
  const { submitFeedback } = useComplaints();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitFeedback(complaint.id, rating, comment.trim() || 'Work verified by student.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Maintenance Resolution" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-800">{complaint.title}</div>
          <div className="text-slate-500">{complaint.room} • {complaint.building}</div>
        </div>

        <div className="text-center py-2">
          <p className="text-xs font-semibold text-slate-600 mb-2">
            How satisfied are you with the resolution speed and quality?
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-xs font-bold text-amber-700 mt-2">
            {rating === 5 && 'Outstanding & Quick Resolution!'}
            {rating === 4 && 'Good Job, Satisfied'}
            {rating === 3 && 'Acceptable Repair'}
            {rating === 2 && 'Needs Improvement'}
            {rating === 1 && 'Unsatisfactory Resolution'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Comments & Feedback (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Share any comments regarding technician conduct, cleanup, or residual issues..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <CheckCircle className="w-4 h-4" />
            Submit Feedback
          </button>
        </div>
      </form>
    </Modal>
  );
}
