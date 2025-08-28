
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import Account from "./pages/Account";
import DevicesPage from "./pages/DevicesPage";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AppStore from "./pages/AppStore";
import Education from "./pages/Education";
import GuardianNova from "./pages/GuardianNova";
import NovaReader from "./pages/NovaReader";
import NovaLearning from "./pages/NovaLearning";
import Rewards from "./pages/Rewards";
import Monitoring from "./pages/Monitoring";
import Security from "./pages/Security";
import Products from "./pages/Products";
import ProductOSFull from "./pages/ProductOSFull";
import ProductOSMini from "./pages/ProductOSMini";
import ProductDevice from "./pages/ProductDevice";
import ProductReceiver from "./pages/ProductReceiver";
import About from "./pages/About";
import Blog from "./pages/Blog";
import PressReleases from "./pages/PressReleases";
import PitchDeck from "./pages/PitchDeck";
import BrandAssets from "./pages/BrandAssets";
import HowToGuide from "./pages/HowToGuide";
import HomeworkHelper from "./pages/HomeworkHelper";
import CodeShare from "./pages/CodeShare";
import DeviceActivation from "./pages/DeviceActivation";
import ActivatePage from "./pages/ActivatePage";
import ActivationComplete from "./pages/ActivationComplete";
import CreatorMode from "./pages/CreatorMode";
import NotFound from "./pages/NotFound";
import OnlineSafetyLivestream from "./pages/OnlineSafetyLivestream";
import LivestreamSpeaker from "./pages/LivestreamSpeaker";
import AuthGuard from "@/components/AuthGuard";
import AdminRoute from "@/components/AdminRoute";

// Games
import BlocklyMaze from "./pages/games/BlocklyMaze";
import TuxMath from "./pages/games/TuxMath";

// Play pages
import Antura from "./pages/play/Antura";
import BlocklyMazePlay from "./pages/play/BlocklyMaze";
import NovacraftPyramid from "./pages/play/NovacraftPyramid";
import SpaceTrek from "./pages/play/SpaceTrek";
import Turtlestitch from "./pages/play/Turtlestitch";
import TuxMathPlay from "./pages/play/TuxMath";

// Activities
import TurtlestitchActivity from "./pages/activities/Turtlestitch";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDevices from "./pages/admin/AdminDevices";
import AdminDeviceDetail from "./pages/admin/AdminDeviceDetail";
import AdminAppCatalog from "./pages/admin/AdminAppCatalog";
import AdminBooksIngest from "./pages/admin/AdminBooksIngest";
import AdminContentPush from "./pages/admin/AdminContentPush";
import AdminUIThemes from "./pages/admin/AdminUIThemes";
import AdminWaitlist from "./pages/AdminWaitlist";

// OTA Demo pages
import OtaDemoLayout from "./pages/admin/ota-demo/OtaDemoLayout";
import OtaUpdateManager from "./pages/admin/ota-demo/OtaUpdateManager";
import OtaReports from "./pages/admin/ota-demo/OtaReports";

// Documentation
import DocsLayout from "./pages/docs/DocsLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/os-full" element={<ProductOSFull />} />
              <Route path="/products/os-mini" element={<ProductOSMini />} />
              <Route path="/products/device" element={<ProductDevice />} />
              <Route path="/products/receiver" element={<ProductReceiver />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/press" element={<PressReleases />} />
              <Route path="/pitch" element={<PitchDeck />} />
              <Route path="/brand" element={<BrandAssets />} />
              <Route path="/how-to" element={<HowToGuide />} />
              <Route path="/homework" element={<HomeworkHelper />} />
              <Route path="/code-share" element={<CodeShare />} />
              <Route 
                path="/device-activation" 
                element={
                  <AuthGuard>
                    <DeviceActivation />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/activate" 
                element={
                  <AuthGuard>
                    <ActivatePage />
                  </AuthGuard>
                } 
              />
              <Route path="/activation-complete" element={<ActivationComplete />} />
              
              {/* Livestream routes - public front page, private speaker pages */}
              <Route path="/online-safety-livestream" element={<OnlineSafetyLivestream />} />
              <Route path="/online-safety-livestream/:speakerSlug" element={<LivestreamSpeaker />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/children" element={<AuthGuard><Children /></AuthGuard>} />
              <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
              <Route path="/devices" element={<AuthGuard><DevicesPage /></AuthGuard>} />
              <Route path="/app-store" element={<AuthGuard><AppStore /></AuthGuard>} />
              <Route path="/education" element={<AuthGuard><Education /></AuthGuard>} />
              <Route path="/nova" element={<AuthGuard><GuardianNova /></AuthGuard>} />
              <Route path="/nova-reader" element={<AuthGuard><NovaReader /></AuthGuard>} />
              <Route path="/nova-learning" element={<AuthGuard><NovaLearning /></AuthGuard>} />
              <Route path="/rewards" element={<AuthGuard><Rewards /></AuthGuard>} />
              <Route path="/monitoring" element={<AuthGuard><Monitoring /></AuthGuard>} />
              <Route path="/security" element={<AuthGuard><Security /></AuthGuard>} />
              <Route path="/creator-mode" element={<AuthGuard><CreatorMode /></AuthGuard>} />

              {/* Games */}
              <Route path="/games/blockly-maze" element={<AuthGuard><BlocklyMaze /></AuthGuard>} />
              <Route path="/games/tuxmath" element={<AuthGuard><TuxMath /></AuthGuard>} />

              {/* Play pages */}
              <Route path="/play/antura" element={<Antura />} />
              <Route path="/play/blockly-maze" element={<BlocklyMazePlay />} />
              <Route path="/play/novacraft-pyramid" element={<NovacraftPyramid />} />
              <Route path="/play/space-trek" element={<SpaceTrek />} />
              <Route path="/play/turtlestitch" element={<Turtlestitch />} />
              <Route path="/play/tuxmath" element={<TuxMathPlay />} />

              {/* Activities */}
              <Route path="/activities/turtlestitch" element={<AuthGuard><TurtlestitchActivity /></AuthGuard>} />

              {/* Admin routes */}
              <Route path="/admin/waitlist" element={<AdminRoute><AdminWaitlist /></AdminRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDevices />} />
                <Route path="devices" element={<AdminDevices />} />
                <Route path="devices/:deviceId" element={<AdminDeviceDetail />} />
                <Route path="app-catalog" element={<AdminAppCatalog />} />
                <Route path="books-ingest" element={<AdminBooksIngest />} />
                <Route path="content-push" element={<AdminContentPush />} />
                <Route path="ui-themes" element={<AdminUIThemes />} />
              </Route>

              {/* OTA Demo routes */}
              <Route path="/admin/ota-demo" element={<AdminRoute><OtaDemoLayout /></AdminRoute>}>
                <Route index element={<OtaUpdateManager />} />
                <Route path="updates" element={<OtaUpdateManager />} />
                <Route path="reports" element={<OtaReports />} />
              </Route>

              {/* Documentation */}
              <Route path="/docs/*" element={<DocsLayout><div /></DocsLayout>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
