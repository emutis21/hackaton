"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Linkedin, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

interface MatchProfile {
  id: string;
  name: string;
  headline: string | null;
  linkedinUrl: string | null;
  email: string;
}

interface MatchWithProfile {
  matchId: string;
  matchedAt: string;
  profile: MatchProfile | undefined;
}

function EmptyMatches() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Users className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Sin matches todavia</h1>
      <p className="text-muted-foreground mb-6">
        Sigue explorando perfiles para encontrar conexiones
      </p>
      <Button asChild>
        <Link href="/discover">Descubrir perfiles</Link>
      </Button>
    </div>
  );
}

function MatchesList({ matches }: { matches: MatchWithProfile[] }) {
  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/discover">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Tus Matches</h1>
      </div>

      <div className="grid gap-4">
        {matches.map(({ matchId, matchedAt, profile }) => {
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

export default function MatchesPage() {
  const { userId, isLoading: sessionLoading } = useSession();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function fetchMatches() {
      try {
        const res = await fetch(`/api/matches?userId=${userId}`);
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, [userId, sessionLoading]);

  if (sessionLoading || isLoading) {
    return <LoadingFallback />;
  }

  if (!userId) {
    return <NoUserFallback />;
  }

  if (matches.length === 0) {
    return <EmptyMatches />;
  }

  return <MatchesList matches={matches} />;
}
