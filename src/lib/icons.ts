import {
  Folder, FolderOpen, FolderTree, BookOpen, Book, BookMarked,
  Code, CodeXml, Terminal, Palette, Music, Video, Image,
  Newspaper, Briefcase, Heart, Star, Shield, Settings, Layout,
  Lightbulb, Zap, TrendingUp, ShoppingCart, Archive, Tag,
  Globe, Database, Cloud, Cpu, Award, Radio, Gamepad2,
  Home, Camera, Film, Mic, Headphones, Monitor, Smartphone,
  Rocket, Plane, Car, Bike, Coffee, Pizza, Apple,
  GraduationCap, School, FlaskConical, Microscope, Stethoscope,
  DollarSign, Wallet, CreditCard, PiggyBank,
  MessageCircle, Mail, Send, Users, UserPlus,
  Lock, Key, Eye, Search, Filter,
  Wrench, Hammer, Paintbrush, Scissors, Pen,
  MapPin, Navigation, Compass, Flag, Bookmark,
  Calendar, Clock, Timer, AlarmClock,
  FileText, Files, Clipboard, NotebookPen,
  Package, Box, Gift, Trophy, Medal,
  Sun, Moon, CloudRain, Snowflake, Flame,
  Bug, Bot, Brain, Sparkles, Wand2,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Folder, FolderOpen, FolderTree,
  BookOpen, Book, BookMarked,
  Code, CodeXml, Terminal,
  Palette, Music, Video, Image,
  Newspaper, Briefcase, Heart, Star, Shield, Settings, Layout,
  Lightbulb, Zap,
  Trending: TrendingUp, TrendingUp,
  Shopping: ShoppingCart,
  Archive, Tag,
  Globe, Database, Cloud, Cpu, Award, Radio, Gamepad2,
  Home, Camera, Film, Mic, Headphones, Monitor, Smartphone,
  Rocket, Plane, Car, Bike, Coffee, Pizza, Apple,
  GraduationCap, School, FlaskConical, Microscope, Stethoscope,
  DollarSign, Wallet, CreditCard, PiggyBank,
  MessageCircle, Mail, Send, Users, UserPlus,
  Lock, Key, Eye, Search, Filter,
  Wrench, Hammer, Paintbrush, Scissors, Pen,
  MapPin, Navigation, Compass, Flag, Bookmark,
  Calendar, Clock, Timer, AlarmClock,
  FileText, Files, Clipboard, NotebookPen,
  Package, Box, Gift, Trophy, Medal,
  Sun, Moon, CloudRain, Snowflake, Flame,
  Bug, Bot, Brain, Sparkles, Wand2,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

// ✅ Cores predefinidas para categorias
export const CATEGORY_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#EAB308", // yellow
  "#84CC16", // lime
  "#22C55E", // green
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#A855F7", // purple
  "#D946EF", // fuchsia
  "#EC4899", // pink
  "#F43F5E", // rose
  "#78716C", // stone
];

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || ICON_MAP.Folder;
}
