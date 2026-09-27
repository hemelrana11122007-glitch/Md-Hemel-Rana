import React, { useState, useEffect } from 'react';
import { CategoryListView } from './CategoryListView';
import { CategoryFormView } from './CategoryFormView';

interface CategoryManagementViewProps {
  onShowToast: (message: string) => void;
}

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({
  onShowToast,
}) => {
  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Sync with browser URL /admin/category/create on mount & popstate
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname;
      if (path.includes('/admin/category/create')) {
        setViewMode('create');
        setEditingCategoryId(null);
      } else if (path.includes('/admin/category/edit/')) {
        const catId = path.split('/admin/category/edit/')[1];
        if (catId) {
          setViewMode('edit');
          setEditingCategoryId(catId);
        }
      } else {
        setViewMode('list');
        setEditingCategoryId(null);
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  const handleNavigateToAdd = () => {
    setViewMode('create');
    setEditingCategoryId(null);
    try {
      window.history.pushState({}, '', '/admin/category/create');
    } catch (_) {}
  };

  const handleNavigateToEdit = (catId: string) => {
    setViewMode('edit');
    setEditingCategoryId(catId);
    try {
      window.history.pushState({}, '', `/admin/category/edit/${catId}`);
    } catch (_) {}
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingCategoryId(null);
    try {
      window.history.pushState({}, '', '/admin/category');
    } catch (_) {}
  };

  if (viewMode === 'create') {
    return (
      <CategoryFormView
        initialCategoryId={null}
        onBack={handleBackToList}
        onShowToast={onShowToast}
      />
    );
  }

  if (viewMode === 'edit') {
    return (
      <CategoryFormView
        initialCategoryId={editingCategoryId}
        onBack={handleBackToList}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <CategoryListView
      onNavigateToAdd={handleNavigateToAdd}
      onNavigateToEdit={handleNavigateToEdit}
      onShowToast={onShowToast}
    />
  );
};
