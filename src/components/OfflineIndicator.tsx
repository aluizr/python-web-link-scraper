import { WifiOff, RefreshCw } from "lucide-react";
import { useOfflineStatus } from "@/hooks/use-offline-status";
import { getPendingCount } from "@/lib/offline-cache";
import { Badge } from "@/components/ui/badge";

/**
 * Banner que aparece quando o usuário está offline.
 * Mostra também o número de ações pendentes para sincronização.
 */
export function OfflineIndicator() {
  const { isOffline } = useOfflineStatus();
  const pendingCount = getPendingCount();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
        <WifiOff className="h-4 w-4" />
        <span>Modo offline</span>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="ml-1 bg-amber-700 text-white hover:bg-amber-700">
            <RefreshCw className="mr-1 h-3 w-3" />
            {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}
