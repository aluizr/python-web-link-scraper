import { useStats } from "@/hooks/use-stats";
import { useLinks } from "@/hooks/use-links";
import { StatsOverview } from "./StatsOverview";
import { CategoriesChart, TagsCloud, GrowthChart } from "./StatsCharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface StatsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsDashboard({ isOpen, onClose }: StatsDashboardProps) {
  const { links } = useLinks();
  const { basicStats, categoryStats, tagStats, growthData, timelineStats } = useStats(links);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <div>
            <DialogTitle>Dashboard de Estatísticas</DialogTitle>
            <DialogDescription>Visualize sua coleção de links em detalhes</DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overview Cards */}
          <StatsOverview basicStats={basicStats} timelineStats={timelineStats} />

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <CategoriesChart data={categoryStats} />
            <TagsCloud data={tagStats} />
          </div>

          {/* Growth Chart - Full Width */}
          <GrowthChart data={growthData} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
