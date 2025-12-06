import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne, notInArray } from "drizzle-orm";

import { db } from "@/db/client";
import { profiles, swipes } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!currentUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get IDs of profiles already swiped by this user
    const swipedProfiles = await db
      .select({ swipedId: swipes.swipedId })
      .from(swipes)
      .where(eq(swipes.swiperId, currentUserId));

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
          ne(profiles.id, currentUserId),
          eq(profiles.onboardingCompleted, true),
          eq(profiles.isActive, true),
          swipedIds.length > 0 ? notInArray(profiles.id, swipedIds) : undefined
        )
      )
      .limit(limit);

    return NextResponse.json({ profiles: availableProfiles });
  } catch (error) {
    console.error("Get profiles error:", error);
    return NextResponse.json({ error: "Failed to get profiles" }, { status: 500 });
  }
}
