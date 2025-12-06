import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";

import { db } from "@/db/client";
import { matches, profiles } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
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
      return NextResponse.json({ matches: [] });
    }

    // Fetch all matched profiles
    const matchedProfiles = await db
      .select()
      .from(profiles)
      .where(
        or(...matchedProfileIds.map((id) => eq(profiles.id, id)))
      );

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

    return NextResponse.json({ matches: matchesWithProfiles });
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json({ error: "Failed to get matches" }, { status: 500 });
  }
}
