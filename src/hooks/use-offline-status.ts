import { useState, useEffect, useCallback } from "react";

/**
 * Hook para detectar status online/offline do navegador.
 * Atualiza reactivamente quando a conexão muda.
 */
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        // Sinaliza que voltou de um período offline
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return { isOffline, wasOffline };
}
