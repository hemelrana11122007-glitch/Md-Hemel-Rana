import React, { useState } from 'react';
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
          onSelectView={(view) => setActiveView(view)}
          onExitDashboard={handleExitDashboard}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
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
            onNavigateView={(view) => setActiveView(view)}
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
