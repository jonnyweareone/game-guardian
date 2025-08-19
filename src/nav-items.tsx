import { HomeIcon, ShieldIcon, Users, Settings, Smartphone, ShoppingBag, UserCheck, FileText, Briefcase, Megaphone, BookOpen, Package, GraduationCap } from "lucide-react";

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
import HomeworkHelper from "./pages/HomeworkHelper";
import GuardianNova from "./pages/GuardianNova";

export interface NavItem {
  title: string;
  to: string;
  icon: React.ReactElement;
  page: React.ReactElement;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <HomePage />,
    requiresAuth: false,
  },
  {
    title: "Index",
    to: "/index", 
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
    requiresAuth: false,
  },
  {
    title: "Guardian Nova",
    to: "/guardian-nova",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <GuardianNova />,
    requiresAuth: false,
  },
  {
    title: "Homework Helper",
    to: "/homework-helper",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <HomeworkHelper />,
    requiresAuth: false,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: <Dashboard />,
    requiresAuth: true,
  },
  {
    title: "Dashboard V2",
    to: "/dashboard-v2",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: <DashboardV2 />,
    requiresAuth: true,
  },
  {
    title: "App Store",
    to: "/app-store",
    icon: <ShoppingBag className="h-4 w-4" />,
    page: <AppStore />,
    requiresAuth: false,
  },
  {
    title: "Devices",
    to: "/devices",
    icon: <Smartphone className="h-4 w-4" />,
    page: <DevicesPage />,
    requiresAuth: true,
  },
  {
    title: "Account",
    to: "/account", 
    icon: <Users className="h-4 w-4" />,
    page: <Account />,
    requiresAuth: true,
  },
  {
    title: "Products",
    to: "/products",
    icon: <Package className="h-4 w-4" />,
    page: <Products />,
    requiresAuth: false,
  },
  {
    title: "About",
    to: "/about",
    icon: <UserCheck className="h-4 w-4" />,
    page: <About />,
    requiresAuth: false,
  },
  {
    title: "How To Guide",
    to: "/how-to-guide",
    icon: <BookOpen className="h-4 w-4" />,
    page: <HowToGuide />,
    requiresAuth: false,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: <UserCheck className="h-4 w-4" />,
    page: <Auth />,
    requiresAuth: false,
  },
  {
    title: "Reset Password",
    to: "/reset-password",
    icon: <Settings className="h-4 w-4" />,
    page: <ResetPassword />,
    requiresAuth: false,
  },
  {
    title: "Security",
    to: "/security",
    icon: <ShieldIcon className="h-4 w-4" />,
    page: <Security />,
    requiresAuth: true,
  },
  {
    title: "Device Activation",
    to: "/device-activation",
    icon: <Smartphone className="h-4 w-4" />,
    page: <DeviceActivation />,
    requiresAuth: true,
  },
  {
    title: "Creator Mode",
    to: "/creator-mode",
    icon: <Settings className="h-4 w-4" />,
    page: <CreatorMode />,
    requiresAuth: true,
  },
  {
    title: "Blog",
    to: "/blog",
    icon: <FileText className="h-4 w-4" />,
    page: <Blog />,
    requiresAuth: false,
  },
  {
    title: "Press Releases",
    to: "/press-releases",
    icon: <Megaphone className="h-4 w-4" />,
    page: <PressReleases />,
    requiresAuth: false,
  },
  {
    title: "Brand Assets",
    to: "/brand-assets",
    icon: <Briefcase className="h-4 w-4" />,
    page: <BrandAssets />,
    requiresAuth: false,
  },
  {
    title: "Pitch Deck",
    to: "/pitch-deck",
    icon: <FileText className="h-4 w-4" />,
    page: <PitchDeck />,
    requiresAuth: false,
  },
  {
    title: "Admin Waitlist",
    to: "/admin/waitlist",
    icon: <Users className="h-4 w-4" />,
    page: <AdminWaitlist />,
    requiresAuth: true,
    requiresAdmin: true,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminLayout />,
    requiresAuth: true,
    requiresAdmin: true,
  },
];
