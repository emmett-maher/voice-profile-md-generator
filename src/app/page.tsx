import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getAppMode } from "@/lib/mode";
import { DemoStudio } from "@/components/DemoStudio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function DemoBanner({ missing }: { missing: string[] }) {
  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardContent className="space-y-1 p-4 text-sm">
        <p className="font-medium">
          Demo mode: you&apos;re exploring seeded transcripts from fictional creators and a
          recorded synthesis run.
        </p>
        <p className="text-muted-foreground">
          The citation verification, repair routing, and markdown assembly below run for real —
          only the model calls are recorded. To run the full ingest→synthesize→export flow on your
          own content, copy <code className="font-mono">.env.example</code> to{" "}
          <code className="font-mono">.env</code> and fill in:{" "}
          <code className="font-mono">{missing.join(", ")}</code> (plus the Convex-side keys — see
          the README).
        </p>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const { mode, missing } = getAppMode();

  if (mode === "demo") {
    return (
      <div className="space-y-6">
        <section className="space-y-2 pt-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Your voice, distilled into a file Claude can write with.
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Ingest a creator&apos;s videos, podcasts, and posts; watch an agentic loop name the
            patterns in how they talk; export a markdown profile where{" "}
            <strong className="text-foreground">every claim is defended by a verbatim quote</strong>{" "}
            from their own content — verified by code, never by the model.
          </p>
        </section>
        <DemoBanner missing={missing} />
        <DemoStudio />
      </div>
    );
  }

  const session = await auth();
  if (session?.user) redirect("/studio");

  return (
    <div className="mx-auto max-w-xl space-y-6 py-16 text-center">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Your voice, distilled into a file Claude can write with.
      </h1>
      <p className="text-muted-foreground">
        Connect your content, watch the synthesis loop defend every claim with a verified quote,
        and export a system-prompt-ready markdown profile.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/studio" });
        }}
      >
        <Button size="lg" type="submit">
          Sign in with Google
        </Button>
      </form>
    </div>
  );
}
