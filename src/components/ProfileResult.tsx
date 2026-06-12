"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SECTION_LABELS, PROFILE_SECTIONS } from "@/lib/voice/schema";
import type { Confidence, SynthesisStats, VerifiedTrait } from "@/lib/voice/types";

export interface ProfileResultData {
  creatorName: string;
  confidence: Confidence;
  stats: SynthesisStats;
  traits: VerifiedTrait[];
  markdown: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "voice-profile";
}

export function ProfileResult({ profile }: { profile: ProfileResultData }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(profile.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([profile.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(profile.creatorName)}-voice-profile.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {profile.confidence === "grounded" ? (
          <Badge variant="success">Grounded — every claim cited &amp; verified</Badge>
        ) : (
          <Badge variant="warning">Low confidence — thin input, ingest more content</Badge>
        )}
        <Badge variant="secondary">{profile.stats.wordsIngested.toLocaleString()} words ingested</Badge>
        <Badge variant="secondary">{profile.stats.sourcesUsed} sources</Badge>
        <Badge variant="secondary">{profile.stats.traitsVerified} traits verified</Badge>
        {profile.stats.traitsRepaired > 0 && (
          <Badge variant="outline">{profile.stats.traitsRepaired} repaired</Badge>
        )}
        {profile.stats.traitsDropped > 0 && (
          <Badge variant="outline">{profile.stats.traitsDropped} dropped</Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Verified traits</CardTitle>
            <CardDescription>
              Each trait is defended by a verbatim quote located in the stored transcripts.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[32rem] space-y-5 overflow-y-auto">
            {PROFILE_SECTIONS.map((section) => {
              const traits = profile.traits.filter((t) => t.section === section);
              if (traits.length === 0) return null;
              return (
                <div key={section}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {SECTION_LABELS[section]}
                  </h4>
                  <div className="space-y-3">
                    {traits.map((trait) => (
                      <div key={trait.id} className="rounded-md border border-border p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{trait.name}</span>
                          {trait.outcome === "repaired" && (
                            <Badge variant="outline" className="text-[10px]">
                              repaired
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{trait.claim}</p>
                        {trait.citations.map((c, i) => (
                          <blockquote
                            key={i}
                            className="mt-2 border-l-2 border-accent-foreground/40 pl-2 font-mono text-xs"
                          >
                            “{c.quote}”
                            <span className="text-muted-foreground">
                              {" "}
                              — {c.sourceTitle} ({c.sourcePlatform})
                            </span>
                          </blockquote>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="font-serif text-lg">Markdown export</CardTitle>
                <CardDescription>
                  Self-contained — paste straight into Claude as a system prompt.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" onClick={download}>
                  <Download /> Download .md
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md bg-muted/60 p-3 font-mono text-xs leading-relaxed">
              {profile.markdown}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
