"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import type { FormattedEvent } from "@/lib/events";

export interface EventTimelineProps {
  events: FormattedEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No contract events recorded for this programme yet.
      </div>
    );
  }

  return (
    <div className="relative space-y-4 before:absolute before:bottom-0 before:left-3 before:top-2 before:w-0.5 before:bg-border">
      {events.map((event, idx) => (
        <div key={idx} className="relative flex items-start gap-4 pl-8">
          <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-background bg-accent" />
          <div className="flex-1 rounded-md border border-border bg-card p-4 text-sm shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{event.title}</span>
                <Badge tone={event.badgeTone}>{event.type}</Badge>
              </div>
            </div>

            <p className="mt-1 text-muted-foreground">{event.description}</p>

            {event.details && Object.keys(event.details).length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded bg-muted/40 p-2.5 text-xs sm:grid-cols-3">
                {Object.entries(event.details).map(([key, val]) => {
                  const copyVal = event.copyValues?.[key];
                  return (
                    <div key={key}>
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="flex items-center gap-1 font-mono">
                        <span>{val}</span>
                        {copyVal && (
                          <CopyButton value={copyVal} label={`Copy ${key.toLowerCase()}`} />
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
