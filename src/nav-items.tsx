
import { HomeIcon, Users, Settings, Shield, BookOpen, Newspaper, HelpCircle, Palette, Info } from "lucide-react";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import DashboardV2 from "./pages/DashboardV2";
import DevicesPage from "./pages/DevicesPage";
import DeviceActivation from "./pages/DeviceActivation";
import Products from "./pages/Products";
import ProductDevice from "./pages/ProductDevice";
import ProductReceiver from "./pages/ProductReceiver";
import ProductOSFull from "./pages/ProductOSFull";
import ProductOSMini from "./pages/ProductOSMini";
import About from "./pages/About";
import Security from "./pages/Security";
import Account from "./pages/Account";
import Blog from "./pages/Blog";
import PressReleases from "./pages/PressReleases";
import HowToGuide from "./pages/HowToGuide";
import BrandAssets from "./pages/BrandAssets";
import PitchDeck from "./pages/PitchDeck";
import CreatorMode from "./pages/CreatorMode";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDevices from "./pages/admin/AdminDevices";
import AdminDeviceDetail from "./pages/admin/AdminDeviceDetail";
import AdminAppCatalog from "./pages/admin/AdminAppCatalog";
import AdminContentPush from "./pages/admin/AdminContentPush";
import AdminUIThemes from "./pages/admin/AdminUIThemes";
import AdminWaitlist from "./pages/AdminWaitlist";
import OtaDemoLayout from "./pages/admin/ota-demo/OtaDemoLayout";
import OtaUpdateManager from "./pages/admin/ota-demo/OtaUpdateManager";
import OtaReports from "./pages/admin/ota-demo/OtaReports";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/home",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <HomePage />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <Users className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Dashboard V2",
    to: "/dashboard-v2",
    icon: <Settings className="h-4 w-4" />,
    page: <DashboardV2 />,
  },
  {
    title: "Devices",
    to: "/devices",
    icon: <Settings className="h-4 w-4" />,
    page: <DevicesPage />,
  },
  {
    title: "Device Activation",
    to: "/device-activation",
    icon: <Settings className="h-4 w-4" />,
    page: <DeviceActivation />,
  },
  {
    title: "Products",
    to: "/products",
    icon: <Settings className="h-4 w-4" />,
    page: <Products />,
  },
  {
    title: "Product Device",
    to: "/product-device",
    icon: <Settings className="h-4 w-4" />,
    page: <ProductDevice />,
  },
  {
    title: "Product Receiver",
    to: "/product-receiver",
    icon: <Settings className="h-4 w-4" />,
    page: <ProductReceiver />,
  },
  {
    title: "Product OS Full",
    to: "/product-os-full",
    icon: <Settings className="h-4 w-4" />,
    page: <ProductOSFull />,
  },
  {
    title: "Product OS Mini",
    to: "/product-os-mini",
    icon: <Settings className="h-4 w-4" />,
    page: <ProductOSMini />,
  },
  {
    title: "About",
    to: "/about",
    icon: <Info className="h-4 w-4" />,
    page: <About />,
  },
  {
    title: "Security",
    to: "/security",
    icon: <Shield className="h-4 w-4" />,
    page: <Security />,
  },
  {
    title: "Account",
    to: "/account",
    icon: <Settings className="h-4 w-4" />,
    page: <Account />,
  },
  {
    title: "Blog",
    to: "/blog",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Blog />,
  },
  {
    title: "Press Releases",
    to: "/press-releases",
    icon: <Newspaper className="h-4 w-4" />,
    page: <PressReleases />,
  },
  {
    title: "How To Guide",
    to: "/how-to-guide",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <HowToGuide />,
  },
  {
    title: "Brand Assets",
    to: "/brand-assets",
    icon: <Palette className="h-4 w-4" />,
    page: <BrandAssets />,
  },
  {
    title: "Pitch Deck",
    to: "/pitch-deck",
    icon: <BookOpen className="h-4 w-4" />,
    page: <PitchDeck />,
  },
  {
    title: "Creator Mode",
    to: "/creator-mode",
    icon: <Settings className="h-4 w-4" />,
    page: <CreatorMode />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <Shield className="h-4 w-4" />,
    page: <Auth />,
  },
  {
    title: "Reset Password",
    to: "/reset-password",
    icon: <Shield className="h-4 w-4" />,
    page: <ResetPassword />,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminLayout />,
  },
  {
    title: "Admin Devices",
    to: "/admin/devices",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDevices />,
  },
  {
    title: "Admin Device Detail",
    to: "/admin/devices/:id",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDeviceDetail />,
  },
  {
    title: "Admin App Catalog",
    to: "/admin/app-catalog",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminAppCatalog />,
  },
  {
    title: "Admin Content Push",
    to: "/admin/content-push",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminContentPush />,
  },
  {
    title: "Admin UI Themes",
    to: "/admin/ui-themes",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminUIThemes />,
  },
  {
    title: "Admin Waitlist",
    to: "/admin/waitlist",
    icon: <Users className="h-4 w-4" />,
    page: <AdminWaitlist />,
  },
  {
    title: "OTA Demo",
    to: "/admin/ota-demo",
    icon: <Settings className="h-4 w-4" />,
    page: <OtaDemoLayout />,
  },
  {
    title: "OTA Updates",
    to: "/admin/ota-demo/updates",
    icon: <Settings className="h-4 w-4" />,
    page: <OtaUpdateManager />,
  },
  {
    title: "OTA Reports",
    to: "/admin/ota-demo/reports",
    icon: <Settings className="h-4 w-4" />,
    page: <OtaReports />,
  },
  {
    title: "404",
    to: "*",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <NotFound />,
  },
];
