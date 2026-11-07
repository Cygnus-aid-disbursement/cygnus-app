"use client";

import * as React from "react";

export interface AstrolabeBadgeProps {
  source?: string;
  className?: string;
  attestationId?: string;
}

export function AstrolabeBadge({
  source = "Astrolabe Schema Registry",
  className = "",
  attestationId,
}: AstrolabeBadgeProps) {
  return (
    <span
      tabIndex={0}
      role="note"
      className={`inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      title={`Verified NGO via ${source}. Confirms organization identity; does not represent on-chain proof of physical aid delivery.`}
      aria-label={`Verified NGO via ${source}. Note: Blockchain records funds movement under protocol rules, not physical delivery of aid.${attestationId ? ` Attestation ID: ${attestationId}.` : ""}`}
    >
      <svg
        className="h-3 w-3 text-blue-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <span>Verified NGO</span>
    </span>
  );
}
