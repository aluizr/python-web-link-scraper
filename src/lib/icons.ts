import {
  Folder, BookOpen, Code, Palette, Music, Video, Image,
  Newspaper, Briefcase, Heart, Star, Shield, Settings, Layout,
  Lightbulb, Zap, TrendingUp, ShoppingCart, Archive, Tag,
  Globe, Database, Cloud, Cpu, Award, Radio, Gamepad2,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Folder,
  BookOpen,
  Code,
  Palette,
  Music,
  Video,
  Image,
  Newspaper,
  Briefcase,
  Heart,
  Star,
  Shield,
  Settings,
  Layout,
  Lightbulb,
  Zap,
  Trending: TrendingUp,
  Shopping: ShoppingCart,
  Archive,
  Tag,
  Globe,
  Database,
  Cloud,
  Cpu,
  Award,
  Radio,
  Gamepad2,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || ICON_MAP.Folder;
}
