import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AdminSidebar, AdminViewKey } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminProfileSecurityModal } from '../../components/admin/AdminProfileSecurityModal';
import { DashboardOverviewView } from '../../components/admin/views/DashboardOverviewView';
import { WebsiteSeoView } from '../../components/admin/views/WebsiteSeoView';
import { SellerVerificationView } from '../../components/admin/views/SellerVerificationView';
import { ManageSellersView } from '../../components/admin/views/ManageSellersView';
import { ManageCustomersView } from '../../components/admin/views/ManageCustomersView';
import { OrderManagementView } from '../../components/admin/views/OrderManagementView';
import { ActivityLogsView } from '../../components/admin/views/ActivityLogsView';
import { PaymentTaxView } from '../../components/admin/views/PaymentTaxView';
import { AnalyticsReportsView } from '../../components/admin/views/AnalyticsReportsView';
import { ManageProductsView } from '../../components/admin/views/ManageProductsView';
import { GeneralModuleView } from '../../components/admin/views/GeneralModuleView';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onOpenAuth: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateHome,
  onOpenAuth,
  onShowToast,
}) => {
  const { logout, setIsMailboxOpen } = useAuth();

  const [activeView, setActiveView] = useState<AdminViewKey>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileSecurityOpen, setIsProfileSecurityOpen] = useState(false);

  // Notification & Real-Time Badge Counts
  const [newSellersCount, setNewSellersCount] = useState<number>(0);
  const [newCustomersCount, setNewCustomersCount] = useState<number>(0);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState<number>(0);

  const fetchLiveCounts = useCallback(async () => {
    try {
      const res = await adminApi.getNotifications();
      if (res.success && res.notifications) {
        const notifs = res.notifications;
        const unreadSellers = notifs.filter(
          (n: any) =>
            (n.unread || !n.read) &&
            (n.targetView === 'manage-sellers' ||
              (n.title && n.title.toLowerCase().includes('seller registration')))
        ).length;

        const unreadCustomers = notifs.filter(
          (n: any) =>
            (n.unread || !n.read) &&
            (n.targetView === 'manage-customers' ||
              (n.title && n.title.toLowerCase().includes('customer account')))
        ).length;

        const unreadVerifications = notifs.filter(
          (n: any) =>
            (n.unread || !n.read) &&
            (n.targetView === 'seller-verification' || n.category === 'verification')
        ).length;

        setNewSellersCount(unreadSellers);
        setNewCustomersCount(unreadCustomers);
        setPendingVerificationsCount(unreadVerifications);
      }
    } catch {
      // Ignored in background poll
    }
  }, []);

  useEffect(() => {
    fetchLiveCounts();
    const interval = setInterval(fetchLiveCounts, 3500);
    return () => clearInterval(interval);
  }, [fetchLiveCounts]);

  const handleSelectView = (view: AdminViewKey) => {
    setActiveView(view);
    if (view === 'manage-sellers') {
      adminApi.markNotificationsRead(undefined, 'manage-sellers');
      setNewSellersCount(0);
    } else if (view === 'manage-customers') {
      adminApi.markNotificationsRead(undefined, 'manage-customers');
      setNewCustomersCount(0);
    } else if (view === 'seller-verification') {
      adminApi.markNotificationsRead(undefined, 'seller-verification');
      setPendingVerificationsCount(0);
    }
  };

  // Exit Dashboard handler: Clears HTTP-only cookies and redirects to Home Page
  const handleExitDashboard = async () => {
    try {
      await logout();
      onShowToast('Logged out of Super Admin Dashboard. Session cleared.');
    } catch {
      // Ignored
    }
    onNavigateHome();
  };

  return (
    <ProtectedRoute
      allowedRoles={['admin']}
      onNavigateHome={onNavigateHome}
      onOpenAuth={onOpenAuth}
    >
      <div className="h-screen overflow-hidden bg-[#F8FAFA] flex antialiased font-sans text-slate-800">
        {/* Sidebar Navigation */}
        <AdminSidebar
          activeView={activeView}
          onSelectView={handleSelectView}
          onExitDashboard={handleExitDashboard}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          pendingVerificationsCount={pendingVerificationsCount}
          newSellersCount={newSellersCount}
          newCustomersCount={newCustomersCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header */}
          <AdminHeader
            activeView={activeView}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenProfileSecurity={() => setIsProfileSecurityOpen(true)}
            onExitDashboard={handleExitDashboard}
            onNavigateHome={onNavigateHome}
            onNavigateView={handleSelectView}
          />

          {/* Dynamic View Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {activeView === 'overview' && (
                <DashboardOverviewView
                  onNavigateView={(view) => setActiveView(view)}
                  onOpenProfileSecurity={() => setIsProfileSecurityOpen(true)}
                  onShowToast={onShowToast}
                />
              )}

              {activeView === 'analytics-reports' && (
                <AnalyticsReportsView onShowToast={onShowToast} />
              )}

              {activeView === 'activity-logs' && (
                <ActivityLogsView onShowToast={onShowToast} />
              )}

              {activeView === 'seller-verification' && (
                <SellerVerificationView onShowToast={onShowToast} />
              )}

              {activeView === 'manage-sellers' && (
                <ManageSellersView onShowToast={onShowToast} />
              )}

              {activeView === 'manage-customers' && (
                <ManageCustomersView onShowToast={onShowToast} />
              )}

              {activeView === 'order-management' && (
                <OrderManagementView onShowToast={onShowToast} />
              )}

              {(activeView === 'website-seo' || activeView === 'seo-general-identity') && (
                <WebsiteSeoView initialSubTab="general-identity" onShowToast={onShowToast} />
              )}

              {activeView === 'seo-xml-sitemap' && (
                <WebsiteSeoView initialSubTab="xml-sitemap" onShowToast={onShowToast} />
              )}

              {activeView === 'seo-robots-txt' && (
                <WebsiteSeoView initialSubTab="robots-txt" onShowToast={onShowToast} />
              )}

              {activeView === 'payment-tax' && (
                <PaymentTaxView onShowToast={onShowToast} />
              )}

              {activeView === 'manage-product' && (
                <ManageProductsView onShowToast={onShowToast} />
              )}

              {/* All other modules handled smoothly with specialized controls */}
              {![
                'overview',
                'analytics-reports',
                'activity-logs',
                'seller-verification',
                'manage-sellers',
                'manage-customers',
                'order-management',
                'manage-product',
                'website-seo',
                'seo-general-identity',
                'seo-xml-sitemap',
                'seo-robots-txt',
                'payment-tax',
              ].includes(activeView) && (
                <GeneralModuleView
                  viewKey={activeView}
                  onShowToast={onShowToast}
                  onNavigateView={(view) => setActiveView(view)}
                />
              )}
            </div>
          </main>
        </div>

        {/* Edit Profile / Security Settings Modal (Requirement 2) */}
        <AdminProfileSecurityModal
          isOpen={isProfileSecurityOpen}
          onClose={() => setIsProfileSecurityOpen(false)}
          onShowToast={onShowToast}
        />
      </div>
    </ProtectedRoute>
  );
};
