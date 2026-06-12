import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getAppMode } from "@/lib/mode";
import { FullModeProviders } from "@/components/providers";
import { Studio } from "@/components/Studio";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const { mode } = getAppMode();
  if (mode === "demo") redirect("/");
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Signed in as <strong className="text-foreground">{session.user.email}</strong> — you can
          only see and generate from sources you ingested (enforced server-side).
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
      <FullModeProviders convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}>
        <Studio userName={session.user.name} />
      </FullModeProviders>
    </div>
  );
}
