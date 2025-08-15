import { HomeIcon, ShieldIcon, Users, Settings, Smartphone, ShoppingBag, UserCheck, FileText, Briefcase, Megaphone, BookOpen, Package } from "lucide-react";

import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import DashboardV2 from "./pages/DashboardV2";
import DevicesPage from "./pages/DevicesPage";
import Account from "./pages/Account";
import Products from "./pages/Products";
import About from "./pages/About";
import HowToGuide from "./pages/HowToGuide";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Security from "./pages/Security";
import DeviceActivation from "./pages/DeviceActivation";
import CreatorMode from "./pages/CreatorMode";
import Blog from "./pages/Blog";
import PressReleases from "./pages/PressReleases";
import BrandAssets from "./pages/BrandAssets";
import PitchDeck from "./pages/PitchDeck";
import AdminWaitlist from "./pages/AdminWaitlist";
import AdminLayout from "./pages/admin/AdminLayout";
import AppStore from "./pages/AppStore";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <HomePage />,
  },
  {
    title: "Index",
    to: "/index", 
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Dashboard V2",
    to: "/dashboard-v2",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: <DashboardV2 />,
  },
  {
    title: "App Store",
    to: "/app-store",
    icon: <ShoppingBag className="h-4 w-4" />,
    page: <AppStore />,
  },
  {
    title: "Devices",
    to: "/devices",
    icon: <Smartphone className="h-4 w-4" />,
    page: <DevicesPage />,
  },
  {
    title: "Account",
    to: "/account", 
    icon: <Users className="h-4 w-4" />,
    page: <Account />,
  },
  {
    title: "Products",
    to: "/products",
    icon: <Package className="h-4 w-4" />,
    page: <Products />,
  },
  {
    title: "About",
    to: "/about",
    icon: <UserCheck className="h-4 w-4" />,
    page: <About />,
  },
  {
    title: "How To Guide",
    to: "/how-to-guide",
    icon: <BookOpen className="h-4 w-4" />,
    page: <HowToGuide />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <UserCheck className="h-4 w-4" />,
    page: <Auth />,
  },
  {
    title: "Reset Password",
    to: "/reset-password",
    icon: <Settings className="h-4 w-4" />,
    page: <ResetPassword />,
  },
  {
    title: "Security",
    to: "/security",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: <Security />,
  },
  {
    title: "Device Activation",
    to: "/device-activation",
    icon: <Smartphone className="h-4 w-4" />,
    page: <DeviceActivation />,
  },
  {
    title: "Creator Mode",
    to: "/creator-mode",
    icon: <Settings className="h-4 w-4" />,
    page: <CreatorMode />,
  },
  {
    title: "Blog",
    to: "/blog",
    icon: <FileText className="h-4 w-4" />,
    page: <Blog />,
  },
  {
    title: "Press Releases",
    to: "/press-releases",
    icon: <Megaphone className="h-4 w-4" />,
    page: <PressReleases />,
  },
  {
    title: "Brand Assets",
    to: "/brand-assets",
    icon: <Briefcase className="h-4 w-4" />,
    page: <BrandAssets />,
  },
  {
    title: "Pitch Deck",
    to: "/pitch-deck",
    icon: <FileText className="h-4 w-4" />,
    page: <PitchDeck />,
  },
  {
    title: "Admin Waitlist",
    to: "/admin/waitlist",
    icon: <Users className="h-4 w-4" />,
    page: <AdminWaitlist />,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminLayout />,
  },
];
