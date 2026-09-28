import React, { useState, useEffect } from 'react';
import { BrandListView } from './BrandListView';
import { BrandFormView } from './BrandFormView';

interface BrandManagementViewProps {
  onShowToast: (message: string) => void;
}

export const BrandManagementView: React.FC<BrandManagementViewProps> = ({
  onShowToast,
}) => {
  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  // Sync with browser URL e.g. /admin/brands/create on mount & popstate
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname;
      if (path.includes('/admin/brands/create') || path.includes('/admin/brand/create')) {
        setViewMode('create');
        setEditingBrandId(null);
      } else if (path.includes('/admin/brands/edit/') || path.includes('/admin/brand/edit/')) {
        const parts = path.includes('/admin/brands/edit/')
          ? path.split('/admin/brands/edit/')
          : path.split('/admin/brand/edit/');
        const brandId = parts[1];
        if (brandId) {
          setViewMode('edit');
          setEditingBrandId(brandId);
        }
      } else {
        setViewMode('list');
        setEditingBrandId(null);
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  const handleNavigateToAdd = () => {
    setViewMode('create');
    setEditingBrandId(null);
    try {
      window.history.pushState({}, '', '/admin/brands/create');
    } catch (_) {}
  };

  const handleNavigateToEdit = (brandId: string) => {
    setViewMode('edit');
    setEditingBrandId(brandId);
    try {
      window.history.pushState({}, '', `/admin/brands/edit/${brandId}`);
    } catch (_) {}
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingBrandId(null);
    try {
      window.history.pushState({}, '', '/admin/brands');
    } catch (_) {}
  };

  if (viewMode === 'create') {
    return (
      <BrandFormView
        initialBrandId={null}
        onBack={handleBackToList}
        onShowToast={onShowToast}
      />
    );
  }

  if (viewMode === 'edit') {
    return (
      <BrandFormView
        initialBrandId={editingBrandId}
        onBack={handleBackToList}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <BrandListView
      onNavigateToAdd={handleNavigateToAdd}
      onNavigateToEdit={handleNavigateToEdit}
      onShowToast={onShowToast}
    />
  );
};
