"use client";

import { useState } from "react";
import { PartyPopper, UserX } from "lucide-react";
import Link from "next/link";

import { SwipeCard } from "@/components/swipe-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/db/schema";

interface DiscoverContentProps {
  profiles: Profile[];
  userId: string;
}

export function DiscoverContent({ profiles: initialProfiles, userId }: DiscoverContentProps) {
  const [profiles] = useState<Profile[]>(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  const handleSwipe = async (direction: "left" | "right") => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swiperId: userId,
          swipedId: currentProfile.id,
          direction,
        }),
      });

      const data = await response.json();

      if (data.isMatch) {
        setMatchedProfile(currentProfile);
        setShowMatch(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error swiping:", error);
    }
  };

  const closeMatchModal = () => {
    setShowMatch(false);
    setMatchedProfile(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <UserX className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">No hay más perfiles</h1>
        <p className="text-muted-foreground mb-6">
          Has visto todos los perfiles disponibles. Vuelve más tarde.
        </p>
        <Button asChild variant="outline">
          <Link href={`/matches?userId=${userId}`}>Ver tus matches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Descubre</h1>

      <SwipeCard profile={currentProfile} onSwipe={handleSwipe} />

      <p className="text-center text-sm text-muted-foreground mt-4">
        {profiles.length - currentIndex - 1} perfiles restantes
      </p>

      {/* Match Modal */}
      {showMatch && matchedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <PartyPopper className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Match!</h2>
              <p className="text-muted-foreground mb-4">
                Tú y {matchedProfile.name} quieren conectar
              </p>

              {matchedProfile.linkedinUrl && (
                <Button asChild className="w-full mb-2">
                  <a
                    href={matchedProfile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver LinkedIn
                  </a>
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={closeMatchModal}>
                Seguir explorando
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
