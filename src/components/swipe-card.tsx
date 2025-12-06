"use client";

import { X, Heart, Briefcase, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/db/schema";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
}

export function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary mx-auto mb-4">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-center">{profile.name}</h2>
          {profile.headline && (
            <p className="text-sm text-muted-foreground text-center mt-1">
              {profile.headline}
            </p>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {profile.industry && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                <Briefcase className="w-3 h-3" />
                {profile.industry}
              </span>
            )}
            {profile.experienceYears && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                {profile.experienceYears}+ años exp
              </span>
            )}
          </div>

          {profile.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                >
                  {skill}
                </span>
              ))}
              {profile.skills.length > 5 && (
                <span className="px-2 py-1 text-muted-foreground text-xs">
                  +{profile.skills.length - 5} más
                </span>
              )}
            </div>
          )}

          {profile.lookingFor && (
            <p className="text-sm">
              <span className="text-muted-foreground">Busca:</span>{" "}
              <span className="font-medium capitalize">{profile.lookingFor}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 p-6 pt-0">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14 p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onSwipe("left")}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
            onClick={() => onSwipe("right")}
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
