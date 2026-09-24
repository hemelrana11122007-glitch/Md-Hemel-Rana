import React from 'react';
import { CommunityGroup } from '../components/CommunityGroup';
import { GroupPost } from '../types/marketplace';

interface GroupPageProps {
  onJoinDiscussion: () => void;
  onViewPost: (post: GroupPost) => void;
}

export const GroupPage: React.FC<GroupPageProps> = ({
  onJoinDiscussion,
  onViewPost,
}) => {
  return (
    <div className="py-6 min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#008080] font-semibold">Community Group Forum</span>
        </div>
      </div>
      <CommunityGroup
        onJoinDiscussion={onJoinDiscussion}
        onViewPost={onViewPost}
      />
    </div>
  );
};
