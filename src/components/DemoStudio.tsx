"use client";

import { useMemo, useRef, useState } from "react";
import { BellRing, Play, RotateCcw } from "lucide-react";
import { DEMO_PERSONAS } from "@/lib/demo";
import type { DemoPersona } from "@/lib/demo/types";
import { createRecordedModel } from "@/lib/demo/recordedModel";
import { runSynthesisPipeline } from "@/lib/voice/pipeline";
import { countWords } from "@/lib/voice/verify";
import type { SynthesisEvent } from "@/lib/voice/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SynthesisFeed } from "@/components/SynthesisFeed";
import { ProfileResult, type ProfileResultData } from "@/components/ProfileResult";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube",
  podcast: "Podcast",
  blog: "Blog",
  social: "Social",
};

function SourceList({ persona }: { persona: DemoPersona }) {
  return (
    <div className="space-y-2">
      {persona.sources.map((source) => {
        const passages = persona.passages.filter((p) => p.sourceId === source.id);
        const words = passages.reduce((n, p) => n + countWords(p.text), 0);
        return (
          <div
            key={source.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{source.title}</p>
              <p className="text-xs text-muted-foreground">
                {PLATFORM_LABEL[source.platform] ?? source.platform} · {passages.length} passages
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {words.toLocaleString()} words
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

export function DemoStudio() {
  const [personaId, setPersonaId] = useState(DEMO_PERSONAS[0].id);
  const [events, setEvents] = useState<SynthesisEvent[]>([]);
  const [result, setResult] = useState<ProfileResultData | null>(null);
  const [running, setRunning] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const runCounter = useRef(0);

  const persona = useMemo(
    () => DEMO_PERSONAS.find((p) => p.id === personaId) ?? DEMO_PERSONAS[0],
    [personaId],
  );

  const switchPersona = (id: string) => {
    runCounter.current += 1; // cancel any in-flight replay
    setPersonaId(id);
    setEvents([]);
    setResult(null);
    setRunning(false);
    setNotification(null);
  };

  const run = async () => {
    const myRun = (runCounter.current += 1);
    setEvents([]);
    setResult(null);
    setNotification(null);
    setRunning(true);
    try {
      const outcome = await runSynthesisPipeline({
        creatorName: persona.name,
        passages: persona.passages,
        sources: persona.sources,
        model: createRecordedModel(persona, { latencyMs: 260 }),
        emit: async (event) => {
          if (runCounter.current !== myRun) throw new Error("run cancelled");
          setEvents((prev) => [...prev, event]);
          await sleep(event.type.startsWith("citation") ? 120 : 320);
        },
      });
      if (runCounter.current !== myRun) return;
      setResult({
        creatorName: persona.name,
        confidence: outcome.confidence,
        stats: outcome.stats,
        traits: outcome.traits,
        markdown: outcome.markdown,
      });
      // In-app notification — the keyless fallback for the Resend email.
      setNotification(
        `Synthesis for ${persona.name} finished: ${outcome.stats.traitsVerified} traits verified` +
          (outcome.confidence === "low_confidence" ? " (low confidence — thin input)." : "."),
      );
    } catch {
      // pipeline already emitted a "failed" event, or the run was cancelled
    } finally {
      if (runCounter.current === myRun) setRunning(false);
    }
  };

  const hasRun = events.length > 0 || result !== null;

  return (
    <div className="space-y-6">
      {notification && (
        <div className="flex items-center gap-2 rounded-md border border-accent-foreground/30 bg-accent px-3 py-2 text-sm text-accent-foreground">
          <BellRing className="size-4 shrink-0" />
          <span>
            <strong>Notification</strong> (in-app fallback — set RESEND_API_KEY for email):{" "}
            {notification}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={personaId} onValueChange={switchPersona}>
          <TabsList>
            {DEMO_PERSONAS.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button onClick={run} disabled={running}>
          {hasRun ? <RotateCcw /> : <Play />}
          {running ? "Synthesizing…" : hasRun ? "Replay recorded run" : "Generate voice profile"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg">{persona.name}</CardTitle>
            <CardDescription>{persona.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{persona.description}</p>
            <SourceList persona={persona} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Live synthesis</CardTitle>
            <CardDescription>
              A recorded model run replayed through the real pipeline: schema validation, verbatim
              citation checks, repairs, and drops all execute live in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SynthesisFeed events={events} running={running} />
          </CardContent>
        </Card>
      </div>

      {result && <ProfileResult profile={result} />}
    </div>
  );
}
