"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { useSession } from "@/hooks/use-session";
import { DiscoverContent } from "@/components/discover-content";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/db/schema";

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

export default function DiscoverPage() {
  const { userId, isLoading: sessionLoading } = useSession();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function fetchProfiles() {
      try {
        const res = await fetch(`/api/profiles?userId=${userId}`);
        const data = await res.json();
        setProfiles(data.profiles || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfiles();
  }, [userId, sessionLoading]);

  if (sessionLoading || isLoading) {
    return <LoadingFallback />;
  }

  if (!userId) {
    return <NoUserFallback />;
  }

  return <DiscoverContent profiles={profiles} userId={userId} />;
}
