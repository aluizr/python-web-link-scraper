import { useMemo } from "react";
import type { LinkItem } from "@/types/link";
import type { LinkStats, CategoryStats, TagStats, GrowthData, TimelineStats } from "@/types/stats";

export function useStats(links: LinkItem[]) {
  // ✅ Estatísticas básicas
  const basicStats = useMemo<LinkStats>(() => {
    const categorySet = new Set(links.map((l) => l.category).filter(Boolean));
    const tagSet = new Set(links.flatMap((l) => l.tags));
    const favorites = links.filter((l) => l.isFavorite).length;

    return {
      totalLinks: links.length,
      totalFavorites: favorites,
      totalCategories: categorySet.size,
      totalTags: tagSet.size,
      avgLinksPerCategory: categorySet.size > 0 ? links.length / categorySet.size : 0,
      avgTagsPerLink: links.length > 0 ? links.flatMap((l) => l.tags).length / links.length : 0,
    };
  }, [links]);

  // ✅ Distribuição por categoria
  const categoryStats = useMemo<CategoryStats[]>(() => {
    const map = new Map<string, number>();
    links.forEach((link) => {
      if (link.category) {
        map.set(link.category, (map.get(link.category) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [links]);

  // ✅ Tag cloud
  const tagStats = useMemo<TagStats[]>(() => {
    const map = new Map<string, number>();
    links.forEach((link) => {
      link.tags.forEach((tag) => {
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 tags
  }, [links]);

  // ✅ Timeline (crescimento ao longo do tempo)
  const growthData = useMemo<GrowthData[]>(() => {
    const map = new Map<string, number>();
    let cumulative = 0;

    // Agrupar por data
    links
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((link) => {
        const date = new Date(link.createdAt).toISOString().split("T")[0];
        map.set(date, (map.get(date) || 0) + 1);
      });

    // Converter para array com cumulative
    return Array.from(map.entries()).map(([date, count]) => {
      cumulative += count;
      return { date, count, cumulative };
    });
  }, [links]);

  // ✅ Timeline com períodos
  const timelineStats = useMemo<TimelineStats>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    return {
      today: links.filter((l) => new Date(l.createdAt) >= today).length,
      thisWeek: links.filter((l) => new Date(l.createdAt) >= weekAgo).length,
      thisMonth: links.filter((l) => new Date(l.createdAt) >= monthAgo).length,
      thisYear: links.filter((l) => new Date(l.createdAt) >= yearAgo).length,
      allTime: links.length,
    };
  }, [links]);

  return {
    basicStats,
    categoryStats,
    tagStats,
    growthData,
    timelineStats,
  };
}
