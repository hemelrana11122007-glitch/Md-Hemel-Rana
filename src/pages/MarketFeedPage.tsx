import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Send,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Users,
  Calendar,
  Newspaper,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Check,
  Plus,
  Search,
  Filter,
  Sparkles,
  MoreHorizontal,
  X,
  ExternalLink,
  Globe,
  Building2,
  Eye,
  BarChart2,
  ChevronRight,
  Clock,
  Play,
  CheckCircle2,
  Tag,
  Briefcase,
  AlertTriangle,
  Lock,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MARKET_FEED_POSTS } from '../data/mockData';
import { MarketFeedPost, MarketFeedComment } from '../types/marketplace';

interface MarketFeedPageProps {
  onJoinDiscussion?: () => void;
  onViewPost?: (post: MarketFeedPost) => void;
}

type FeedFilterType = 'all' | 'sellers' | 'community' | 'own' | 'saved';

export const MarketFeedPage: React.FC<MarketFeedPageProps> = ({
  onJoinDiscussion,
  onViewPost,
}) => {
  const { user } = useAuth();

  // Profile Sidebar Display Info (Default to Md Mehedi Hasan if not logged in)
  const profileName = user?.name || 'Md Mehedi Hasan';
  const profileTitle = user?.store_name
    ? `${user.store_name} · ${user.business_type || 'Verified Merchant'}`
    : user?.business_type
    ? `${user.business_type} Merchant · AR Market BD`
    : user?.role === 'admin'
    ? 'Super Admin · AR Market BD'
    : 'AR Market Bd · Verified Merchant';
  const profileLocation = user?.address || 'Pabna, Rajshahi';
  const profileAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80';
  const profileCover =
    user?.cover_photo ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=240&q=80';

  // Live Seller Status Registry from Backend (Used for Auto-Hide / Auto-Unhide)
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
      // Background poll silently handles network issues
    }
  }, []);

  useEffect(() => {
    fetchSellerStatuses();
    const interval = setInterval(fetchSellerStatuses, 3500);
    return () => clearInterval(interval);
  }, [fetchSellerStatuses]);

  // Seller Post Creation Restriction Rules:
  // - Admin & Buyer: Permitted
  // - Seller: ONLY allowed if seller_status === 'approved' AND is_locked !== true
  // - If PENDING, NEED DOCS, REJECTED, SUSPENDED, or LOCKED: Blocked from creating posts
  const isSeller = user?.role === 'seller';
  const isSellerLocked = Boolean(user?.is_locked);
  const sellerStatus = (user?.seller_status || 'pending').toLowerCase();
  const isSellerApproved = sellerStatus === 'approved';

  const isSellerRestricted = isSeller && (!isSellerApproved || isSellerLocked);
  const canCreatePost = !isSellerRestricted;

  let postRestrictionMessage = '';
  if (isSellerLocked) {
    postRestrictionMessage = 'Your seller account is currently locked by Super Admin. Post creation is disabled.';
  } else if (isSeller && !isSellerApproved) {
    postRestrictionMessage = 'Your account must be Approved by Super Admin to create posts.';
  }

  // Feed State
  const [posts, setPosts] = useState<MarketFeedPost[]>(() => MARKET_FEED_POSTS);
  const [activeFilter, setActiveFilter] = useState<FeedFilterType>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Expanded Comments per post
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({
    'post-own-1': true,
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Expanded Post content (see more)
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPostMode, setCreatePostMode] = useState<'text' | 'photo' | 'video' | 'article'>('text');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Wholesale Sourcing');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');

  // Analytics Modal
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Profile Analytics numbers
  const [viewersCount, setViewersCount] = useState(1482);
  const [postImpressions, setPostImpressions] = useState(8920);

  // Auto-Hide & Auto-Unhide Logic for Feed Posts:
  // If a seller is SUSPENDED or LOCKED by Admin, their posts are automatically filtered out (hidden) from public feed.
  // When UNSUSPENDED/UNLOCKED/APPROVED, their posts automatically restore (unhide) in real time.
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Check Seller Status Restriction (Auto-Hide on Suspend/Lock)
      const authorId = post.authorId || post.author.id;
      const authorNameLower = post.author.name?.toLowerCase();

      const sellerInfo = authorId && sellerStatusMap[authorId]
        ? sellerStatusMap[authorId]
        : authorNameLower && sellerStatusMap[authorNameLower]
        ? sellerStatusMap[authorNameLower]
        : null;

      if (sellerInfo) {
        // If seller is locked OR suspended -> Auto-hide post from general public feed!
        if (sellerInfo.is_locked || sellerInfo.status === 'suspended') {
          // If current logged-in user is this seller and viewing "My Posts" tab, show with locked indicator
          if (user && (user.id === authorId || user.name?.toLowerCase() === authorNameLower) && activeFilter === 'own') {
            return true;
          }
          return false; // Auto-hidden for all other users & general feed
        }
      }

      // 2. Filter by Tab
      if (activeFilter === 'sellers' && post.sourceType !== 'seller') return false;
      if (activeFilter === 'community' && post.sourceType !== 'community') return false;
      if (activeFilter === 'own' && post.sourceType !== 'own') return false;
      if (activeFilter === 'saved' && !post.isSaved) return false;

      // 3. Filter by Tag
      if (selectedTag && post.tag !== selectedTag) return false;

      // 4. Filter by Search Query
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchContent = (post.content || post.preview).toLowerCase().includes(q);
        const matchAuthor = post.author.name.toLowerCase().includes(q);
        const matchTag = post.tag.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchAuthor && !matchTag) return false;
      }

      return true;
    });
  }, [posts, activeFilter, selectedTag, searchFilter, sellerStatusMap, user]);

  // Action Handlers
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  const handleToggleFollow = (postId: string, authorName: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isFollowing = !p.isFollowing;
          if (isFollowing) {
            showToast(`You are now following ${authorName}`);
          } else {
            showToast(`Unfollowed ${authorName}`);
          }
          return {
            ...p,
            isFollowing,
          };
        }
        return p;
      })
    );
  };

  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isSaved = !p.isSaved;
          showToast(isSaved ? 'Post saved to your bookmarks' : 'Post removed from saved items');
          return {
            ...p,
            isSaved,
          };
        }
        return p;
      })
    );
  };

  const handleSharePost = (post: MarketFeedPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/market-feed#${post.id}`);
    }
    showToast('Post link copied to clipboard!');
  };

  const handleToggleComments = (postId: string) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment: MarketFeedComment = {
      id: `c-${Date.now()}`,
      author: {
        name: profileName,
        role: profileTitle,
        avatar: profileAvatar,
      },
      content: text,
      timeAgo: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const existingComments = p.comments || [];
          return {
            ...p,
            repliesCount: p.repliesCount + 1,
            comments: [...existingComments, newComment],
          };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({
      ...prev,
      [postId]: '',
    }));

    showToast('Comment posted successfully!');
  };

  const handleOpenCreateModal = (mode: 'text' | 'photo' | 'video' | 'article') => {
    if (isSellerRestricted) {
      showToast(postRestrictionMessage || 'Your account must be Approved by Super Admin to create posts.');
      return;
    }
    setCreatePostMode(mode);
    setIsCreateModalOpen(true);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSellerRestricted) {
      showToast(postRestrictionMessage || 'Your account must be Approved by Super Admin to create posts.');
      return;
    }

    if (!newContent.trim()) {
      showToast('Please enter some text for your post');
      return;
    }

    const createdPost: MarketFeedPost = {
      id: `post-user-${Date.now()}`,
      authorId: user?.id || 'usr_mehedi_hasan',
      author: {
        id: user?.id || 'usr_mehedi_hasan',
        name: profileName,
        role: profileTitle,
        company: user?.store_name || 'AR Market BD',
        location: profileLocation,
        avatar: profileAvatar,
      },
      title: newTitle.trim() || newContent.slice(0, 70) + '...',
      preview: newContent.slice(0, 180) + (newContent.length > 180 ? '...' : ''),
      content: newContent,
      repliesCount: 0,
      likesCount: 0,
      timeAgo: 'Just now',
      tag: newTag,
      mediaUrl: newMediaUrl.trim() || undefined,
      mediaType: newMediaType,
      isLiked: false,
      isFollowing: false,
      isSaved: false,
      sourceType: 'own',
      comments: [],
    };

    setPosts([createdPost, ...posts]);
    setPostImpressions((prev) => prev + 15);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewMediaUrl('');
    showToast('Your post has been published to the Market Feed!');
  };

  const trendingTopics = [
    { tag: 'Customs & Trade', count: '1.4k posts', label: '#CustomsTariff2026' },
    { tag: 'Wholesale Sourcing', count: '3.8k posts', label: '#WholesaleElectronics' },
    { tag: 'Group Buy & Logistics', count: '640 posts', label: '#ContainerGroupBuy' },
    { tag: 'Vendor Reviews', count: '920 posts', label: '#PabnaHandloom' },
  ];

  return (
    <div className="bg-[#F3F5F7] text-slate-800 lg:h-[calc(100vh-80px)] lg:overflow-hidden flex flex-col py-3 sm:py-4">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header / Breadcrumb & Search Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#008080] font-bold">Market Feed</span>
            <span>/</span>
            <span className="text-slate-400">Social Hub</span>
          </div>

          {/* Quick Search in Feed */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search posts, topics, vendors..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]/30 shadow-2xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Independent Scroll Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-full items-start">
          {/* =========================================================================
              COLUMN 1 (LEFT SIDEBAR): Profile Widget & Navigation (Hidden on Mobile/Tablet, Visible on Desktop lg:)
             ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:h-full lg:overflow-y-auto custom-scrollbar space-y-4 lg:pr-1.5 pb-6">
            {/* 1. Main Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              {/* Cover Banner */}
              <div className="h-20 sm:h-22 w-full relative bg-gradient-to-r from-[#008080] to-[#005a5a] overflow-hidden">
                <img
                  src={profileCover}
                  alt="Cover Banner"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Profile Avatar & Info */}
              <div className="px-4 pb-4 pt-0 text-center relative">
                {/* Overlapping Avatar */}
                <div className="relative -mt-10 mb-2 inline-block">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-white bg-white shadow-md overflow-hidden mx-auto">
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                      isSellerRestricted ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    title={isSellerRestricted ? 'Posting Restricted' : 'Verified Online'}
                  />
                </div>

                {/* Name & Title */}
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {profileName}
                  </h2>
                  <span title="Verified Trader">
                    <ShieldCheck className="w-4 h-4 text-[#008080] shrink-0" />
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {profileTitle}
                </p>

                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-1.5">
                  <MapPin className="w-3 h-3 text-[#008080]" />
                  <span>{profileLocation}</span>
                </div>

                {/* Seller Account Status Badge in Profile Widget */}
                {isSeller && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-center">
                    {isSellerApproved && !isSellerLocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Merchant Approved</span>
                      </span>
                    ) : isSellerLocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>Account Locked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="uppercase">{sellerStatus}</span> · Approval Needed
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* 2. Analytics Section */}
              <div className="px-4 py-3 text-xs space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsAnalyticsModalOpen(true)}
                  className="w-full flex items-center justify-between group cursor-pointer text-left"
                >
                  <span className="text-slate-500 group-hover:text-slate-900 transition-colors">
                    Profile viewers
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#008080] tabular-nums">
                      {viewersCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-semibold">
                      +14%
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnalyticsModalOpen(true)}
                  className="w-full flex items-center justify-between group cursor-pointer text-left"
                >
                  <span className="text-slate-500 group-hover:text-slate-900 transition-colors">
                    Post impressions
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#008080] tabular-nums">
                      {postImpressions.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-semibold">
                      +28%
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnalyticsModalOpen(true)}
                  className="w-full pt-1 flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-[#008080] transition-colors border-t border-slate-50 cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-[#008080]" />
                    <span>View Detailed Analytics</span>
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* 3. Quick Navigation List */}
              <div className="px-2 py-2 text-xs space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('saved');
                    showToast('Showing your saved trade posts');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                    activeFilter === 'saved'
                      ? 'bg-[#008080]/10 text-[#008080] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className={`w-3.5 h-3.5 ${activeFilter === 'saved' ? 'text-[#008080]' : 'text-slate-400'}`} />
                    <span>Saved Items</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                    {posts.filter((p) => p.isSaved).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('community');
                    showToast('Filtered to Community & Group channels');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                    activeFilter === 'community'
                      ? 'bg-[#008080]/10 text-[#008080] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-3.5 h-3.5 ${activeFilter === 'community' ? 'text-[#008080]' : 'text-slate-400'}`} />
                    <span>Joined Channels & Groups</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-50 text-[#008080]">
                    6
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Subscribed to "Trade Pulse BD" Weekly Newsletter!')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Newspaper className="w-3.5 h-3.5 text-slate-400" />
                    <span>Newsletters</span>
                  </div>
                  <span className="text-[10px] text-[#008080] font-medium">Trade Pulse</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Next Event: Q4 Global Importers Summit · Oct 15, Dhaka')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Events & Expos</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                    Oct 15
                  </span>
                </button>
              </div>
            </div>

            {/* 4. Trending Topics Widget (Left Card 2) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#008080]" />
                  <span>Market Trends</span>
                </h3>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[11px] text-[#008080] hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {trendingTopics.map((topic) => {
                  const isActive = selectedTag === topic.tag;
                  return (
                    <button
                      key={topic.tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag(isActive ? null : topic.tag);
                        showToast(
                          isActive
                            ? 'Removed topic filter'
                            : `Filtered feed by ${topic.tag}`
                        );
                      }}
                      className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isActive ? 'bg-teal-50 font-bold text-[#008080]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className={`text-xs block ${isActive ? 'text-[#008080]' : 'text-slate-800'}`}>
                          {topic.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{topic.count}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* =========================================================================
              COLUMN 2 (CENTRAL FEED): Creator Box & Dynamic Unified Stream (Independent Scroll)
             ========================================================================= */}
          <main className="lg:col-span-8 xl:col-span-9 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar space-y-4 pr-0 lg:pr-1.5 pb-8">
            {/* 1. Post Creator Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
              {/* Seller Status Restriction Warning Alert Box */}
              {isSellerRestricted && (
                <div className="mb-3.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-950">
                      {isSellerLocked
                        ? 'Seller Account Locked'
                        : 'Merchant Approval Required'}
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      {postRestrictionMessage}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-amber-700">
                      <span>Status: <strong className="uppercase font-extrabold">{sellerStatus}</strong></span>
                      <span>·</span>
                      <span>Posts & media publishing will unlock once KYC is verified by Super Admin.</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <button
                  type="button"
                  disabled={isSellerRestricted}
                  onClick={() => handleOpenCreateModal('text')}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm rounded-full border transition-all shadow-2xs ${
                    isSellerRestricted
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                      : 'text-slate-400 bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 cursor-pointer hover:border-[#008080]/40'
                  }`}
                  title={isSellerRestricted ? postRestrictionMessage : 'Create a post'}
                >
                  {isSellerRestricted
                    ? 'Post creation disabled until Approved by Super Admin...'
                    : 'Start a post, share bulk inquiry, or review a seller...'}
                </button>
              </div>

              {/* Creator Shortcut Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSellerRestricted}
                  onClick={() => handleOpenCreateModal('photo')}
                  className={`flex items-center justify-center gap-2 py-2 px-2 text-xs font-semibold rounded-xl transition-colors ${
                    isSellerRestricted
                      ? 'text-slate-400 opacity-50 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-teal-50 hover:text-[#008080] cursor-pointer'
                  }`}
                  title={isSellerRestricted ? postRestrictionMessage : 'Add Photo'}
                >
                  <ImageIcon className="w-4 h-4 text-[#008080]" />
                  <span>Photo</span>
                </button>

                <button
                  type="button"
                  disabled={isSellerRestricted}
                  onClick={() => handleOpenCreateModal('video')}
                  className={`flex items-center justify-center gap-2 py-2 px-2 text-xs font-semibold rounded-xl transition-colors ${
                    isSellerRestricted
                      ? 'text-slate-400 opacity-50 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer'
                  }`}
                  title={isSellerRestricted ? postRestrictionMessage : 'Add Video'}
                >
                  <Video className="w-4 h-4 text-amber-600" />
                  <span>Video</span>
                </button>

                <button
                  type="button"
                  disabled={isSellerRestricted}
                  onClick={() => handleOpenCreateModal('article')}
                  className={`flex items-center justify-center gap-2 py-2 px-2 text-xs font-semibold rounded-xl transition-colors ${
                    isSellerRestricted
                      ? 'text-slate-400 opacity-50 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer'
                  }`}
                  title={isSellerRestricted ? postRestrictionMessage : 'Write Article'}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Write article</span>
                </button>
              </div>
            </div>

            {/* 2. Feed Filter Bar (Quiet, Anti-Slop, Zero-Pill) */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 px-1">
              <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                    activeFilter === 'all'
                      ? 'border-[#008080] text-[#008080]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Posts ({filteredPosts.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('sellers')}
                  className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                    activeFilter === 'sellers'
                      ? 'border-[#008080] text-[#008080]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Followed Sellers
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('community')}
                  className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                    activeFilter === 'community'
                      ? 'border-[#008080] text-[#008080]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Community Leads
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('own')}
                  className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                    activeFilter === 'own'
                      ? 'border-[#008080] text-[#008080]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  My Posts
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('saved')}
                  className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                    activeFilter === 'saved'
                      ? 'border-[#008080] text-[#008080]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Saved ({posts.filter((p) => p.isSaved).length})
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                <span>Active Protection:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Auto-Verified</span>
                </span>
              </div>
            </div>

            {/* 3. Empty State if no matches */}
            {filteredPosts.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 text-[#008080]" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No active posts found in this stream</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Posts from suspended or locked sellers are automatically hidden from the marketplace. Try resetting your filters to view active community trade updates.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSelectedTag(null);
                    setSearchFilter('');
                  }}
                  className="px-4 py-2 bg-[#008080] text-white text-xs font-bold rounded-xl hover:bg-[#006666] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* 4. Unified Posts Feed Stream */}
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const isCommentsOpen = openComments[post.id];
                const commentsList = post.comments || [];
                const isContentExpanded = expandedContent[post.id];
                const fullText = post.content || post.preview;
                const shouldTruncate = fullText.length > 240;

                return (
                  <article
                    key={post.id}
                    id={post.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300"
                  >
                    {/* Post Header Row */}
                    <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 hover:text-[#008080] cursor-pointer transition-colors truncate">
                              {post.author.name}
                            </span>
                            {post.sourceType === 'own' ? (
                              <span className="text-[10px] font-bold text-[#008080] bg-teal-50 px-1.5 py-0.2 rounded">
                                Author
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleFollow(post.id, post.author.name)}
                                className={`text-xs font-bold inline-flex items-center gap-0.5 ml-1 transition-colors cursor-pointer ${
                                  post.isFollowing
                                    ? 'text-slate-500 hover:text-slate-700'
                                    : 'text-[#008080] hover:text-[#006666]'
                                }`}
                              >
                                {post.isFollowing ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Following</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Follow</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {post.author.role}
                            {post.author.company ? ` · ${post.author.company}` : ''}
                          </p>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span>{post.timeAgo}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5 text-slate-400" />
                              <span>Public</span>
                            </span>
                            {post.author.location && (
                              <>
                                <span>·</span>
                                <span>{post.author.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleToggleSave(post.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            post.isSaved
                              ? 'text-[#008080] bg-teal-50'
                              : 'hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title={post.isSaved ? 'Saved' : 'Save Post'}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSharePost(post)}
                          className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 sm:px-5 pb-3 space-y-2">
                      {/* Topic Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {post.title}
                      </h3>

                      {/* Text Body */}
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {shouldTruncate && !isContentExpanded
                          ? `${fullText.slice(0, 240)}... `
                          : fullText}

                        {shouldTruncate && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedContent((prev) => ({
                                ...prev,
                                [post.id]: !isContentExpanded,
                              }))
                            }
                            className="font-bold text-[#008080] hover:underline cursor-pointer ml-1 inline-block"
                          >
                            {isContentExpanded ? 'show less' : '...see more'}
                          </button>
                        )}
                      </div>

                      {/* Category Tag (Clean unboxed metadata) */}
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span className="text-[#008080] font-semibold bg-teal-50/80 border border-teal-100 px-2 py-0.5 rounded-md">
                          {post.tag}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700 font-medium">Verified Merchant Escrow Protected</span>
                      </div>
                    </div>

                    {/* Attached Media (Image / Video preview) */}
                    {post.mediaUrl && (
                      <div className="relative bg-slate-950 overflow-hidden max-h-[460px] border-y border-slate-100">
                        <img
                          src={post.mediaUrl}
                          alt={post.title}
                          className="w-full h-full object-cover max-h-[460px] hover:scale-[1.01] transition-transform duration-300"
                        />
                        {post.mediaType === 'video' && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/90 text-[#008080] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                              <Play className="w-6 h-6 fill-current ml-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reaction Metrics Line */}
                    <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1 items-center">
                          <span className="w-4 h-4 rounded-full bg-[#008080] text-white flex items-center justify-center text-[9px] font-bold">
                            👍
                          </span>
                          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">
                            ❤️
                          </span>
                        </div>
                        <span className="tabular-nums font-medium text-slate-700">
                          {post.likesCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleToggleComments(post.id)}
                          className="hover:text-slate-700 hover:underline cursor-pointer"
                        >
                          <span className="tabular-nums font-medium text-slate-600">
                            {post.repliesCount}
                          </span>{' '}
                          comments
                        </button>
                        <span>·</span>
                        <span>9 shares</span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="px-2 sm:px-4 py-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          post.isLiked
                            ? 'text-[#008080] bg-teal-50/60 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current text-[#008080]' : ''}`} />
                        <span>Like</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleComments(post.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isCommentsOpen
                            ? 'text-[#008080] bg-teal-50/60 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSharePost(post)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          showToast('Trade message opened with author');
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </div>

                    {/* Expandable Comments Section */}
                    {isCommentsOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                        {/* New Comment Input */}
                        <div className="flex items-start gap-3">
                          <img
                            src={profileAvatar}
                            alt={profileName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs({
                                  ...commentInputs,
                                  [post.id]: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder="Add a comment or ask for pricing..."
                              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]/30 shadow-2xs"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleAddComment(post.id)}
                                disabled={!commentInputs[post.id]?.trim()}
                                className="px-3 py-1 bg-[#008080] hover:bg-[#006666] disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                Comment
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Existing Comments List */}
                        {commentsList.length > 0 && (
                          <div className="space-y-3 pt-2">
                            {commentsList.map((comm) => (
                              <div key={comm.id} className="flex items-start gap-2.5">
                                <img
                                  src={comm.author.avatar}
                                  alt={comm.author.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                                />
                                <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <strong className="text-slate-900 font-bold">
                                      {comm.author.name}
                                    </strong>
                                    <span className="text-[10px] text-slate-400">
                                      {comm.timeAgo}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mb-1">
                                    {comm.author.role}
                                  </p>
                                  <p className="text-slate-800 leading-relaxed">
                                    {comm.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* =========================================================================
          CREATE POST MODAL (Interactive Market Composer)
         ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{profileName}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>Post to Verified Public Traders</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePostSubmit} className="space-y-4 pt-4">
              <div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Topic Headline (e.g. In Search of Bamboo Baskets, 500 units)"
                  className="w-full text-sm font-bold text-slate-900 placeholder-slate-400 border-b border-slate-200 pb-2 focus:outline-none focus:border-[#008080]"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What do you want to talk about? Share trade leads, wholesale clearance, or customs updates..."
                  className="w-full text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]/20"
                />
              </div>

              {/* Tag & Media Type Selectors */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#008080]"
                  >
                    <option value="Wholesale Sourcing">Wholesale Sourcing</option>
                    <option value="Group Buy & Logistics">Group Buy & Logistics</option>
                    <option value="Vendor Reviews">Vendor Reviews</option>
                    <option value="Customs & Trade">Customs & Trade</option>
                    <option value="Direct Imports">Direct Imports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Media Attachment
                  </label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as 'image' | 'video')}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#008080]"
                  >
                    <option value="image">Photo / Product Image</option>
                    <option value="video">Product Video Preview</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Image/Media URL
                </label>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image link"
                  className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#008080]"
                />
              </div>

              {/* Submit Row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Verified Escrow Post</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSellerRestricted}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#006666] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-[#008080]/20 transition-all cursor-pointer"
                  >
                    Post to Feed
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ANALYTICS MODAL (Profile & Post Engagement Metrics)
         ========================================================================= */}
      {isAnalyticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAnalyticsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008080] flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-[#008080]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Trade Analytics</h3>
                  <p className="text-[11px] text-slate-400">Past 7 Days Performance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="text-slate-500 block">Profile Viewers</span>
                  <span className="text-xl font-black text-slate-900 block mt-1">
                    {viewersCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    ▲ 14% vs last week
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="text-slate-500 block">Post Impressions</span>
                  <span className="text-xl font-black text-[#008080] block mt-1">
                    {postImpressions.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    ▲ 28% engagement
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50 text-xs text-slate-700 space-y-1.5">
                <strong className="text-[#008080] font-bold block">Top Performing Post</strong>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  "Excited to unveil our Q4 Direct Wholesale Sourcing batch for Verified Merchants..."
                </p>
                <span className="text-[10px] text-slate-500 font-medium block">
                  114 likes · 28 comments · 45 shares
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="px-4 py-1.5 bg-[#008080] text-white text-xs font-bold rounded-lg hover:bg-[#006666] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GroupPage = MarketFeedPage;
