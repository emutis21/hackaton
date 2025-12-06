import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { and, eq, ne, notInArray } from "drizzle-orm";
import Link from "next/link";

import { getSessionUserId } from "@/lib/session";
import { db } from "@/db/client";
import { profiles, swipes } from "@/db/schema";
import { DiscoverContent } from "@/components/discover-content";
import { Button } from "@/components/ui/button";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Cargando perfiles...</p>
    </div>
  );
}

function NoUserFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold mb-4">Necesitas un perfil</h1>
      <p className="text-muted-foreground mb-6">
        Primero completa el onboarding para empezar a descubrir perfiles
      </p>
      <Button asChild>
        <Link href="/onboarding">Crear perfil</Link>
      </Button>
    </div>
  );
}

async function DiscoverLoader() {
  const userId = await getSessionUserId();

  if (!userId) {
    return <NoUserFallback />;
  }

  // Get IDs of profiles already swiped by this user
  const swipedProfiles = await db
    .select({ swipedId: swipes.swipedId })
    .from(swipes)
    .where(eq(swipes.swiperId, userId));

  const swipedIds = swipedProfiles.map((s) => s.swipedId);

  // Get profiles that:
  // 1. Are not the current user
  // 2. Have completed onboarding
  // 3. Are active
  // 4. Haven't been swiped yet
  const availableProfiles = await db
    .select()
    .from(profiles)
    .where(
      and(
        ne(profiles.id, userId),
        eq(profiles.onboardingCompleted, true),
        eq(profiles.isActive, true),
        swipedIds.length > 0 ? notInArray(profiles.id, swipedIds) : undefined
      )
    )
    .limit(20);

  return <DiscoverContent profiles={availableProfiles} userId={userId} />;
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DiscoverLoader />
    </Suspense>
  );
}
