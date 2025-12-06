import { Suspense } from "react";
import { Loader2, Users, Linkedin, Mail, ArrowLeft } from "lucide-react";
import { eq, or } from "drizzle-orm";
import Link from "next/link";

import { config } from "@/lib/config";
import { db } from "@/db/client";
import { matches, profiles } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockCurrentUser, getMatchesForUser } from "@/lib/mock-data";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Cargando matches...</p>
    </div>
  );
}

function NoUserFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-2xl font-bold mb-4">Necesitas un perfil</h1>
      <p className="text-muted-foreground mb-6">
        Primero completa el onboarding para ver tus matches
      </p>
      <Button asChild>
        <Link href="/onboarding">Crear perfil</Link>
      </Button>
    </div>
  );
}

interface MatchesPageProps {
  searchParams: Promise<{ userId?: string }>;
}

interface MatchWithProfile {
  matchId: string;
  matchedAt: Date;
  profile: {
    id: string;
    name: string;
    headline: string | null;
    linkedinUrl: string | null;
    email: string;
  } | undefined;
}

function MatchesList({ matchesWithProfiles, userId }: { matchesWithProfiles: MatchWithProfile[]; userId: string }) {
  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/discover?userId=${userId}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Tus Matches</h1>
      </div>

      <div className="grid gap-4">
        {matchesWithProfiles.map(({ matchId, matchedAt, profile }) => {
          if (!profile) return null;

          return (
            <Card key={matchId}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{profile.name}</h3>
                  {profile.headline && (
                    <p className="text-sm text-muted-foreground truncate">
                      {profile.headline}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Match: {new Date(matchedAt).toLocaleDateString("es-ES")}
                  </p>
                </div>

                <div className="flex gap-2">
                  {profile.linkedinUrl && (
                    <Button asChild size="icon" variant="outline">
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {profile.email && (
                    <Button asChild size="icon" variant="outline">
                      <a href={`mailto:${profile.email}`}>
                        <Mail className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

async function MatchesLoader({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;

  // Use mock data
  if (config.useMockData) {
    const effectiveUserId = userId || mockCurrentUser.id;
    const userMatches = getMatchesForUser(effectiveUserId);

    if (userMatches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Users className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sin matches todavía</h1>
          <p className="text-muted-foreground mb-6">
            Sigue explorando perfiles para encontrar conexiones
          </p>
          <Button asChild>
            <Link href={`/discover?userId=${effectiveUserId}`}>
              Descubrir perfiles
            </Link>
          </Button>
        </div>
      );
    }

    const matchesWithProfiles = userMatches.map((m) => ({
      matchId: m.id,
      matchedAt: m.createdAt,
      profile: m.profile,
    }));

    return (
      <MatchesList matchesWithProfiles={matchesWithProfiles} userId={effectiveUserId} />
    );
  }

  if (!userId) {
    return <NoUserFallback />;
  }

  // Get all matches where this user is either userA or userB
  const userMatches = await db
    .select({
      matchId: matches.id,
      matchedAt: matches.createdAt,
      userAId: matches.userA,
      userBId: matches.userB,
    })
    .from(matches)
    .where(or(eq(matches.userA, userId), eq(matches.userB, userId)));

  // Get the matched profile IDs (the other person in each match)
  const matchedProfileIds = userMatches.map((m) =>
    m.userAId === userId ? m.userBId : m.userAId
  );

  if (matchedProfileIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sin matches todavía</h1>
        <p className="text-muted-foreground mb-6">
          Sigue explorando perfiles para encontrar conexiones
        </p>
        <Button asChild>
          <Link href={`/discover?userId=${userId}`}>Descubrir perfiles</Link>
        </Button>
      </div>
    );
  }

  // Fetch all matched profiles
  const matchedProfiles = await db
    .select()
    .from(profiles)
    .where(or(...matchedProfileIds.map((id) => eq(profiles.id, id))));

  // Combine match data with profile data
  const matchesWithProfiles = userMatches.map((m) => {
    const matchedId = m.userAId === userId ? m.userBId : m.userAId;
    const profile = matchedProfiles.find((p) => p.id === matchedId);
    return {
      matchId: m.matchId,
      matchedAt: m.matchedAt,
      profile,
    };
  });

  return <MatchesList matchesWithProfiles={matchesWithProfiles} userId={userId} />;
}

export default function MatchesPage({ searchParams }: MatchesPageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MatchesLoader searchParams={searchParams} />
    </Suspense>
  );
}
