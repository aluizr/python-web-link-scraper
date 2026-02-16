import { LinkItem } from "./link";

export interface LinkStats {
  totalLinks: number;
  totalFavorites: number;
  totalCategories: number;
  totalTags: number;
  avgLinksPerCategory: number;
  avgTagsPerLink: number;
}

export interface CategoryStats {
  name: string;
  count: number;
}

export interface TagStats {
  name: string;
  count: number;
}

export interface GrowthData {
  date: string;
  count: number;
  cumulative: number;
}

export interface TimelineStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  allTime: number;
}
