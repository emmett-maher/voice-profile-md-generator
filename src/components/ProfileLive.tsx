"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SynthesisFeed } from "@/components/SynthesisFeed";
import { ProfileResult, type ProfileResultData } from "@/components/ProfileResult";
import type { SynthesisEvent } from "@/lib/voice/types";

export function ProfileLive({ profileId }: { profileId: string }) {
  const id = profileId as Id<"profiles">;
  const profile = useQuery(api.profiles.get, { profileId: id });
  const eventDocs = useQuery(api.profiles.events, { profileId: id });

  if (profile === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (profile === null) {
    return <p className="text-sm text-muted-foreground">Profile not found.</p>;
  }

  const events: SynthesisEvent[] = (eventDocs ?? [])
    .slice()
    .sort((a, b) => a.seq - b.seq)
    .map((doc) => doc.event as SynthesisEvent);

  const result: ProfileResultData | null =
    profile.status === "complete" && profile.markdown
      ? {
          creatorName: profile.creatorName,
          confidence: profile.confidence ?? "grounded",
          stats: profile.stats,
          traits: profile.traits ?? [],
          markdown: profile.markdown,
        }
      : null;

  return (
    <div className="space-y-6">
      <Link
        href="/studio"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to studio
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Synthesis run — {profile.creatorName}
          </CardTitle>
          <CardDescription>
            Streaming live from the server-side loop. Failed citations are visibly dropped or
            repaired — nothing unverified ships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SynthesisFeed events={events} running={profile.status === "generating"} />
          {profile.status === "failed" && (
            <p className="mt-3 text-sm text-destructive">Run failed: {profile.error}</p>
          )}
        </CardContent>
      </Card>

      {result && <ProfileResult profile={result} />}
    </div>
  );
}
