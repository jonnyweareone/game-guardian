import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import AdminRoute from "@/components/AdminRoute";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import DevicesPage from "@/pages/DevicesPage";
import Account from "@/pages/Account";
import Children from "@/pages/Children";
import AdminDemo from "@/pages/admin/AdminDemo";
import DemoAdmin from "@/pages/DemoAdmin";
import AdminDevices from "@/pages/admin/AdminDevices";
import AdminAppCatalog from "@/pages/admin/AdminAppCatalog";
import AdminDnsProfiles from "@/pages/admin/AdminDnsProfiles";
import AdminLivestreamFeedback from "@/pages/admin/AdminLivestreamFeedback";
import ChildApps from "@/pages/ChildApps";
import HomePage from "@/pages/HomePage";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Products from "@/pages/Products";
import HowToGuide from "@/pages/HowToGuide";
import DocsRoutes from "@/pages/docs/routes";
import AppStore from "@/pages/AppStore";
import GuardianNova from "@/pages/GuardianNova";
import NovaLearning from "@/pages/NovaLearning";
import NovaReader from "@/pages/NovaReader";
import HomeworkHelper from "@/pages/HomeworkHelper";
import PitchDeck from "@/pages/PitchDeck";
import PressReleases from "@/pages/PressReleases";
import ProductDevice from "@/pages/ProductDevice";
import ProductOSFull from "@/pages/ProductOSFull";
import ProductOSMini from "@/pages/ProductOSMini";
import ProductReceiver from "@/pages/ProductReceiver";
import Security from "@/pages/Security";
import BrandAssets from "@/pages/BrandAssets";
import CodeShare from "@/pages/CodeShare";
import CreatorMode from "@/pages/CreatorMode";
import AdminWaitlist from "@/pages/AdminWaitlist";
import Rewards from "@/pages/Rewards";
import Monitoring from "@/pages/Monitoring";
import Education from "@/pages/Education";
import OnlineSafetyLivestream from "@/pages/OnlineSafetyLivestream";
import LivestreamSpeaker from "@/pages/LivestreamSpeaker";
import OSApps from "@/pages/OSApps";
import ActivatePage from "@/pages/ActivatePage";
import DeviceActivation from "@/pages/DeviceActivation";
import ActivationComplete from "@/pages/ActivationComplete";

const queryClient = new QueryClient();

export default function App() {
  const [_, __] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoAdmin />} />
          <Route path="/auth" element={<AuthGuard requireAuth={false}><Auth /></AuthGuard>} />
          <Route path="/reset" element={<AuthGuard requireAuth={false}><ResetPassword /></AuthGuard>} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/products" element={<Products />} />
          <Route path="/how-to-guide" element={<HowToGuide />} />
          
          {/* Public Event Page */}
          <Route path="/online-safety-livestream" element={<OnlineSafetyLivestream />} />
          <Route path="/online-safety-livestream/speakers/:speakerSlug" element={<LivestreamSpeaker />} />
          
          {/* Docs Routes */}
          <Route path="/docs/*" element={<DocsRoutes />} />
          
          {/* Additional Public Pages */}
          <Route path="/app-store" element={<AppStore />} />
          <Route path="/nova" element={<GuardianNova />} />
          <Route path="/nova-learning" element={<NovaLearning />} />
          <Route path="/novalearning" element={<Navigate to="/nova-learning" replace />} />
          <Route path="/novalearning/*" element={<Navigate to="/nova-learning" replace />} />
          <Route path="/novalearning/reading/:bookId" element={<NovaReader />} />
          <Route path="/nova-education" element={<Navigate to="/education" replace />} />
          <Route path="/nova-reader" element={<NovaReader />} />
          <Route path="/nova-reader/:bookId" element={<NovaReader />} />
          <Route path="/homework-helper" element={<HomeworkHelper />} />
          <Route path="/pitch-deck" element={<PitchDeck />} />
          <Route path="/press-releases" element={<PressReleases />} />
          <Route path="/product/device" element={<ProductDevice />} />
          <Route path="/product/os-full" element={<ProductOSFull />} />
          <Route path="/product/os-mini" element={<ProductOSMini />} />
          <Route path="/product/receiver" element={<ProductReceiver />} />
          <Route path="/security" element={<Security />} />
          <Route path="/brand-assets" element={<BrandAssets />} />
          <Route path="/code-share" element={<CodeShare />} />
          <Route path="/creator-mode" element={<CreatorMode />} />
          <Route path="/admin-waitlist" element={<AdminWaitlist />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/devices"
            element={
              <AuthGuard>
                <DevicesPage />
              </AuthGuard>
            }
          />
          <Route
            path="/account"
            element={
              <AuthGuard>
                <Account />
              </AuthGuard>
            }
          />
          <Route
            path="/children"
            element={
              <AuthGuard>
                <Children />
              </AuthGuard>
            }
          />
          
          {/* Child Apps Routes */}
          <Route
            path="/children/:childId/apps"
            element={
              <AuthGuard>
                <ChildApps />
              </AuthGuard>
            }
          />
          <Route
            path="/children/:childId/apps/control"
            element={
              <AuthGuard>
                <ChildApps />
              </AuthGuard>
            }
          />
          <Route
            path="/children/:childId/apps/store"
            element={
              <AuthGuard>
                <ChildApps />
              </AuthGuard>
            }
          />
          
          {/* Activation Routes - require real auth, demo mode disabled by AuthGuard */}
          <Route
            path="/activate"
            element={
              <AuthGuard>
                <ActivatePage />
              </AuthGuard>
            }
          />
          <Route
            path="/device-activation"
            element={
              <AuthGuard>
                <DeviceActivation />
              </AuthGuard>
            }
          />
          <Route
            path="/activation-complete"
            element={
              <AuthGuard>
                <ActivationComplete />
              </AuthGuard>
            }
          />
          
          {/* OS Apps Route */}
          <Route
            path="/os-apps"
            element={
              <AuthGuard>
                <OSApps />
              </AuthGuard>
            }
          />
          
          {/* Additional Protected Routes */}
          <Route
            path="/monitoring"
            element={
              <AuthGuard>
                <Monitoring />
              </AuthGuard>
            }
          />
          <Route
            path="/education"
            element={
              <AuthGuard>
                <Education />
              </AuthGuard>
            }
          />
          <Route
            path="/rewards"
            element={
              <AuthGuard>
                <Rewards />
              </AuthGuard>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><Navigate to="/admin/devices" replace /></AdminRoute>} />
          <Route
            path="/admin/devices"
            element={
              <AdminRoute>
                <AdminDevices />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/demo"
            element={
              <AdminRoute>
                <AdminDemo />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/app-catalog"
            element={
              <AdminRoute>
                <AdminAppCatalog />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dns-profiles"
            element={
              <AdminRoute>
                <AdminDnsProfiles />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/livestream-feedback"
            element={
              <AdminRoute>
                <AdminLivestreamFeedback />
              </AdminRoute>
            }
          />
          
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}


