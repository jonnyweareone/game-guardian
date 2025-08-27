
import {
  HomeIcon,
  Shield,
  Users,
  Settings,
  BookOpen,
  Gamepad2,
  GraduationCap,
  Trophy,
  Store,
  MonitorSpeaker
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Children",
    url: "/children",
    icon: Users,
  },
  {
    title: "Devices",
    url: "/devices",
    icon: MonitorSpeaker,
  },
  {
    title: "Education",
    url: "/education",
    icon: GraduationCap,
  },
  {
    title: "Nova Reading",
    url: "/nova",
    icon: BookOpen,
  },
  {
    title: "Games & Apps",
    url: "/app-store",
    icon: Store,
  },
  {
    title: "Rewards",
    url: "/rewards",
    icon: Trophy,
  },
  {
    title: "Play",
    url: "/play",
    icon: Gamepad2,
    items: [
      {
        title: "Antura",
        url: "/play/antura",
      },
      {
        title: "Blockly Maze",
        url: "/play/blockly-maze",
      },
      {
        title: "Novacraft Pyramid",
        url: "/play/novacraft-pyramid",
      },
      {
        title: "Space Trek",
        url: "/play/space-trek",
      },
      {
        title: "Turtle Stitch",
        url: "/play/turtlestitch",
      },
      {
        title: "Tux Math",
        url: "/play/tuxmath",
      },
    ],
  },
  {
    title: "Monitoring",
    url: "/monitoring",
    icon: Shield,
  },
  {
    title: "Account",
    url: "/account",
    icon: Settings,
  },
];

// Note: livestream pages are intentionally not in navigation - they're private/direct-link only
