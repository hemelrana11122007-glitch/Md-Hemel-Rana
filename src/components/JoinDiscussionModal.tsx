import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, Users2 } from 'lucide-react';
import { MarketFeedPost } from '../types/marketplace';

interface JoinDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPost?: MarketFeedPost | null;
  onNewPost: (title: string, content: string, tag: string) => void;
}

export const JoinDiscussionModal: React.FC<JoinDiscussionModalProps> = ({
  isOpen,
  onClose,
  selectedPost,
  onNewPost,
}) => {
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [tag, setTag] = useState('General Trade');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicTitle.trim() && topicContent.trim()) {
      onNewPost(topicTitle, topicContent, tag);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setTopicTitle('');
        setTopicContent('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center">
            <Users2 className="w-5 h-5 text-[#008080]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {selectedPost ? 'Join Discussion' : 'Start Market Feed Discussion'}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedPost
                ? `Replying to "${selectedPost.title}"`
                : 'Share wholesale leads, supplier reviews, or customs inquiries'}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-emerald-600 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900">Post Published!</h3>
            <p className="text-xs text-slate-500">Your message is live in the AR Market BD Market Feed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#008080]"
              >
                <option value="Group Buy & Logistics">Bulk Buy & Logistics</option>
                <option value="Vendor Reviews">Vendor Reviews</option>
                <option value="Customs & Trade">Customs & Trade</option>
                <option value="Wholesale Sourcing">Wholesale Sourcing</option>
                <option value="General Trade">General Trade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discussion Title
              </label>
              <input
                type="text"
                required
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Sourcing certified electronic parts from Jane Wholesaler..."
                className="w-full px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#008080]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Message / Inquiries
              </label>
              <textarea
                required
                rows={4}
                value={topicContent}
                onChange={(e) => setTopicContent(e.target.value)}
                placeholder="Describe your inquiry, MOQs needed, or feedback for fellow marketplace vendors..."
                className="w-full px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#008080]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post to Market Feed</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
