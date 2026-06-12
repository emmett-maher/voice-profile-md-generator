"use client";

import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Hammer,
  Loader2,
  Quote,
  Scale,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import type { SynthesisEvent } from "@/lib/voice/types";
import { SECTION_LABELS } from "@/lib/voice/schema";
import { cn } from "@/lib/utils";

function truncate(text: string, n = 90): string {
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

function EventLine({ event }: { event: SynthesisEvent }) {
  switch (event.type) {
    case "run_started":
      return (
        <Line icon={<Sparkles className="text-primary" />}>
          Starting synthesis run for <strong>{event.creatorName}</strong>
        </Line>
      );
    case "sampling":
      return (
        <Line icon={<FileSearch className="text-muted-foreground" />}>
          Sampled <strong>{event.passages}</strong> passages ({event.words.toLocaleString()} words)
          across <strong>{event.sources}</strong> sources
        </Line>
      );
    case "draft_requested":
      return (
        <Line icon={<Loader2 className="animate-spin text-muted-foreground" />}>
          Asking <code className="font-mono text-xs">{event.model}</code> to draft the voice
          profile…
        </Line>
      );
    case "draft_received":
      return (
        <Line icon={<CheckCircle2 className="text-success" />}>
          Draft received: <strong>{event.traitsProposed}</strong> proposed traits — verifying every
          citation against stored transcripts
        </Line>
      );
    case "draft_rejected":
      return (
        <Line icon={<XCircle className="text-destructive" />}>
          Draft rejected by schema validation: {event.reason}
        </Line>
      );
    case "trait_verifying":
      return (
        <Line icon={<Scale className="text-muted-foreground" />}>
          Verifying <strong>{event.name}</strong>{" "}
          <span className="text-muted-foreground">
            ({SECTION_LABELS[event.section]}, {event.citations} citation
            {event.citations === 1 ? "" : "s"})
          </span>
        </Line>
      );
    case "citation_verified":
      return (
        <Line icon={<Quote className="text-success" />} className="pl-6">
          <span className="font-mono text-xs text-muted-foreground">
            ✓ located &quot;{truncate(event.quote)}&quot;
          </span>
        </Line>
      );
    case "citation_failed":
      return (
        <Line icon={<AlertTriangle className="text-warning" />} className="pl-6">
          <span className="font-mono text-xs">
            ✗ not found: &quot;{truncate(event.quote)}&quot;{" "}
            <span className="text-muted-foreground">({event.reason})</span>
          </span>
        </Line>
      );
    case "trait_verified":
      return (
        <Line icon={<CheckCircle2 className="text-success" />}>
          <strong>{event.name}</strong> verified
        </Line>
      );
    case "trait_failed":
      return (
        <Line icon={<XCircle className="text-destructive" />}>
          <strong>{event.name}</strong>: no citation survived — sending to repair
        </Line>
      );
    case "repair_requested":
      return (
        <Line icon={<Hammer className="text-warning" />} className="pl-6">
          Repair pass via <code className="font-mono text-xs">{event.model}</code>: hunting for
          real evidence for <strong>{event.name}</strong>…
        </Line>
      );
    case "trait_repaired":
      return (
        <Line icon={<CheckCircle2 className="text-success" />}>
          <strong>{event.name}</strong> repaired — replacement quote verified verbatim
        </Line>
      );
    case "trait_dropped":
      return (
        <Line icon={<Trash2 className="text-destructive" />}>
          <strong>{event.name}</strong> dropped: {event.reason}
        </Line>
      );
    case "assembling":
      return (
        <Line icon={<Loader2 className="animate-spin text-muted-foreground" />}>
          Assembling markdown from <strong>{event.traitsVerified}</strong> verified traits
          (deterministic — no model involved)
        </Line>
      );
    case "low_confidence":
      return (
        <Line icon={<AlertTriangle className="text-warning" />}>
          Only {event.wordsIngested.toLocaleString()} words ingested (threshold:{" "}
          {event.threshold.toLocaleString()}) — labelling profile <strong>low-confidence</strong>
        </Line>
      );
    case "completed":
      return (
        <Line icon={<CheckCircle2 className="text-success" />}>
          Run complete: {event.stats.traitsVerified} traits verified,{" "}
          {event.stats.traitsRepaired} repaired, {event.stats.traitsDropped} dropped —{" "}
          <strong>{event.confidence === "grounded" ? "grounded" : "low-confidence"}</strong>
        </Line>
      );
    case "failed":
      return (
        <Line icon={<XCircle className="text-destructive" />}>
          Run failed honestly: {event.reason}
        </Line>
      );
    default:
      return null;
  }
}

function Line({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2 py-1 text-sm leading-snug", className)}>
      <span className="mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

export function SynthesisFeed({
  events,
  running,
}: {
  events: SynthesisEvent[];
  running: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [events.length]);

  return (
    <div className="max-h-96 overflow-y-auto rounded-md border border-border bg-muted/40 p-3">
      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {running ? "Waiting for the first event…" : "No synthesis run yet."}
        </p>
      )}
      {events.map((event, i) => (
        <EventLine key={i} event={event} />
      ))}
      {running && (
        <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> working…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
