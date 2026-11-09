"use client";

import * as React from "react";
import { useState, useEffect } from "react";

export interface NetworkStatusProps {
  /**
   * For testing or controlled environments: override the online state.
   */
  forcedOnline?: boolean;
}

export function NetworkStatusIndicator({ forcedOnline }: NetworkStatusProps) {
  const [online, setOnline] = useState<boolean>(() => {
    if (forcedOnline !== undefined) return forcedOnline;
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    if (forcedOnline !== undefined) {
      setOnline(forcedOnline);
      return;
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [forcedOnline]);

  if (online) {
    return (
      <div
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
        title="Connected to network"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        <span className="sr-only">Network status: </span>
        <span>Online</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500"
      title="You are currently offline. Field data may be cached locally."
    >
      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
      <span>Offline Mode</span>
    </div>
  );
}

export function OfflineBanner({ forcedOnline }: NetworkStatusProps) {
  const [online, setOnline] = useState<boolean>(() => {
    if (forcedOnline !== undefined) return forcedOnline;
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    if (forcedOnline !== undefined) {
      setOnline(forcedOnline);
      return;
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [forcedOnline]);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-600 dark:text-amber-400"
    >
      <span className="font-medium">Offline Field Mode:</span> You are disconnected from the
      network. Cached records are readable; on-chain transactions and wallet signing will resume
      when connection is restored.
    </div>
  );
}
