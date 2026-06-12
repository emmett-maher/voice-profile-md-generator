import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAppMode } from "@/lib/mode";
import { FullModeProviders } from "@/components/providers";
import { ProfileLive } from "@/components/ProfileLive";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { mode } = getAppMode();
  if (mode === "demo") redirect("/");
  const session = await auth();
  if (!session?.user) redirect("/");
  const { id } = await params;

  return (
    <FullModeProviders convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}>
      <ProfileLive profileId={id} />
    </FullModeProviders>
  );
}
