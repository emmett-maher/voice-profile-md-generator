"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BellRing, FileText, Loader2, Plus, Sparkles, X } from "lucide-react";
import { DEMO_PERSONAS } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "destructive" | "warning"> = {
  pending: "secondary",
  fetching: "warning",
  transcribing: "warning",
  segmenting: "warning",
  ready: "success",
  error: "destructive",
};

export function Studio({ userName }: { userName?: string | null }) {
  const router = useRouter();
  const sources = useQuery(api.sources.list);
  const profiles = useQuery(api.profiles.list);
  const notifications = useQuery(api.notifications.list);
  const addUrls = useMutation(api.connections.addUrls);
  const seedPersona = useMutation(api.connections.seedPersona);
  const startSynthesis = useMutation(api.synthesis.start);
  const markRead = useMutation(api.notifications.markRead);

  const [urlText, setUrlText] = useState("");
  const [creatorName, setCreatorName] = useState(userName ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readySources = (sources ?? []).filter((s) => s.status === "ready");
  const totalWords = readySources.reduce((n, s) => n + (s.wordCount ?? 0), 0);
  const unread = (notifications ?? []).filter((n) => !n.readAt);

  const wrap = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {unread.map((n) => (
        <div
          key={n._id}
          className="flex items-center justify-between gap-2 rounded-md border border-accent-foreground/30 bg-accent px-3 py-2 text-sm text-accent-foreground"
        >
          <span className="flex items-center gap-2">
            <BellRing className="size-4 shrink-0" /> {n.message}
          </span>
          <Button variant="ghost" size="sm" onClick={() => markRead({ notificationId: n._id })}>
            <X />
          </Button>
        </div>
      ))}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Connect your content</CardTitle>
            <CardDescription>
              Paste video/post URLs (one per line). Ingestion runs as scheduled jobs: captions
              where available, Deepgram speech-to-text as fallback, Haiku segmentation —
              everything stored with provenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder={"https://youtube.com/watch?v=…\nhttps://yourblog.com/post…"}
              rows={4}
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={busy !== null || urlText.trim().length === 0}
                onClick={() =>
                  wrap("urls", async () => {
                    await addUrls({ urls: urlText.split("\n") });
                    setUrlText("");
                  })
                }
              >
                {busy === "urls" ? <Loader2 className="animate-spin" /> : <Plus />} Ingest URLs
              </Button>
              <span className="text-xs text-muted-foreground">or seed a fictional creator:</span>
              {DEMO_PERSONAS.map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => wrap(`seed-${p.id}`, async () => void (await seedPersona({ personaId: p.id })))}
                >
                  {busy === `seed-${p.id}` ? <Loader2 className="animate-spin" /> : null} Seed{" "}
                  {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Generate a profile</CardTitle>
            <CardDescription>
              {readySources.length > 0
                ? `${readySources.length} ready sources · ${totalWords.toLocaleString()} words ingested`
                : "Ingest at least one source first."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Input
              className="max-w-60"
              placeholder="Creator name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
            />
            <Button
              disabled={busy !== null || readySources.length === 0 || creatorName.trim() === ""}
              onClick={() =>
                wrap("generate", async () => {
                  const profileId = await startSynthesis({ creatorName });
                  router.push(`/studio/profile/${profileId}`);
                })
              }
            >
              {busy === "generate" ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate
              voice profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Sources</CardTitle>
          <CardDescription>
            Each source keeps its platform, title, and URL so exported citations can name where
            every quote came from.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sources === undefined ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sources yet.</p>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source._id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{source.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {source.platform}
                      {source.url ? ` · ${source.url}` : ""}
                      {source.error ? ` · ${source.error}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {source.wordCount !== undefined && (
                      <Badge variant="secondary">{source.wordCount.toLocaleString()} words</Badge>
                    )}
                    <Badge variant={STATUS_VARIANT[source.status] ?? "secondary"}>
                      {source.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles === undefined ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No profiles generated yet.</p>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <button
                  key={profile._id}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-border p-3 text-left hover:bg-muted"
                  onClick={() => router.push(`/studio/profile/${profile._id as Id<"profiles">}`)}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="size-4 text-muted-foreground" /> {profile.creatorName}
                  </span>
                  <span className="flex items-center gap-2">
                    {profile.confidence === "low_confidence" && (
                      <Badge variant="warning">low confidence</Badge>
                    )}
                    <Badge
                      variant={
                        profile.status === "complete"
                          ? "success"
                          : profile.status === "failed"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {profile.status}
                    </Badge>
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
