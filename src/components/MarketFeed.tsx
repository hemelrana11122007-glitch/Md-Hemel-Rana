import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users2, MessageSquare, ThumbsUp, Clock, PlusCircle, ArrowRight } from 'lucide-react';
import { MARKET_FEED_POSTS } from '../data/mockData';
import { MarketFeedPost } from '../types/marketplace';

interface MarketFeedProps {
  onJoinDiscussion: () => void;
  onViewPost: (post: MarketFeedPost) => void;
}

export const MarketFeed: React.FC<MarketFeedProps> = ({
  onJoinDiscussion,
  onViewPost,
}) => {
  // Live Seller Status Registry for Auto-Hide / Restore on Homepage Section
  const [sellerStatusMap, setSellerStatusMap] = useState<
    Record<string, { status: string; is_locked: boolean; name: string }>
  >({});

  const fetchSellerStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/market-feed/sellers-status', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.statusMap) {
          setSellerStatusMap(json.statusMap);
        }
      }
    } catch {
      // Ignore background poll errors
    }
  }, []);

  useEffect(() => {
    fetchSellerStatuses();
    const interval = setInterval(fetchSellerStatuses, 4000);
    return () => clearInterval(interval);
  }, [fetchSellerStatuses]);

  // Filter posts based on seller status (Auto-hide suspended or locked sellers)
  const visiblePosts = useMemo(() => {
    return MARKET_FEED_POSTS.filter((post) => {
      const authorId = post.authorId || post.author.id;
      const authorNameLower = post.author.name?.toLowerCase();

      const sellerInfo = authorId && sellerStatusMap[authorId]
        ? sellerStatusMap[authorId]
        : authorNameLower && sellerStatusMap[authorNameLower]
        ? sellerStatusMap[authorNameLower]
        : null;

      if (sellerInfo) {
        if (sellerInfo.is_locked || sellerInfo.status === 'suspended') {
          return false;
        }
      }
      return true;
    });
  }, [sellerStatusMap]);

  return (
    <section id="market-feed-section" className="py-14 bg-[#F8FAFA] border-b border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Box Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8 lg:p-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center shrink-0 border border-teal-200">
                <Users2 className="w-7 h-7 text-[#008080]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#008080]">
                  <span>Market Feed & Discussions</span>
                  <span>·</span>
                  <span className="text-slate-400 font-normal">24,500+ Active Members</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 font-display">
                  Market Feed Discussions
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  Connect directly with verified merchants, wholesale buyers, and freight brokers. Share vendor reviews, explore bulk deals, and get real-time market updates.
                </p>
              </div>
            </div>

            {/* 'Join Discussion' Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onJoinDiscussion}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#008080] hover:bg-[#006666] active:scale-95 rounded-xl shadow-md shadow-[#008080]/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Join Discussion</span>
              </button>
            </div>
          </div>

          {/* Discussion Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {visiblePosts.map((post: MarketFeedPost) => (
              <div
                key={post.id}
                onClick={() => onViewPost(post)}
                className="group flex flex-col bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/70 hover:border-[#008080] hover:shadow-md transition-all duration-200 p-5 cursor-pointer"
              >
                {/* Tag & Time */}
                <div className="flex items-center justify-between gap-2 text-xs mb-3">
                  <span className="font-semibold text-[#008080] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    {post.tag}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {post.timeAgo}
                  </span>
                </div>

                {/* Post Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#008080] transition-colors line-clamp-2 mb-2 leading-snug">
                  {post.title}
                </h3>

                {/* Preview snippet */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {post.preview}
                </p>

                {/* Author & Metrics footer */}
                <div className="mt-auto pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-[#008080] font-bold text-xs flex items-center justify-center">
                      {post.author.name.slice(0, 2)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 leading-none">
                        {post.author.name}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {post.author.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-[#008080]" />
                      <span className="tabular-nums font-semibold">{post.repliesCount}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                      <span className="tabular-nums">{post.likesCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Community banner */}
          <div className="mt-8 p-4 rounded-xl bg-teal-50 border border-teal-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-teal-900">
              <span className="font-bold">Need assistance with custom wholesale pricing or import tariffs?</span>
              <span className="hidden md:inline text-teal-700">Join our 24/7 dedicated trade forum.</span>
            </div>
            <button
              type="button"
              onClick={onJoinDiscussion}
              className="text-xs font-bold text-[#008080] hover:text-[#006666] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All 1,420 Discussions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
