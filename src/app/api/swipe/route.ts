import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { swipes, matches } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { swiperId, swipedId, direction } = await request.json();

    if (!swiperId || !swipedId || !direction) {
      return NextResponse.json(
        { error: "swiperId, swipedId, and direction are required" },
        { status: 400 }
      );
    }

    if (!["left", "right"].includes(direction)) {
      return NextResponse.json(
        { error: "direction must be 'left' or 'right'" },
        { status: 400 }
      );
    }

    // Record the swipe
    await db.insert(swipes).values({
      swiperId,
      swipedId,
      direction,
    });

    // If it's a right swipe, check for a match
    let isMatch = false;
    if (direction === "right") {
      // Check if the other person already swiped right on us
      const [existingSwipe] = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.swiperId, swipedId),
            eq(swipes.swipedId, swiperId),
            eq(swipes.direction, "right")
          )
        )
        .limit(1);

      if (existingSwipe) {
        // It's a match! Create a match record
        await db.insert(matches).values({
          userA: swiperId,
          userB: swipedId,
        });
        isMatch = true;
      }
    }

    return NextResponse.json({
      success: true,
      isMatch,
    });
  } catch (error) {
    console.error("Swipe error:", error);
    return NextResponse.json({ error: "Failed to record swipe" }, { status: 500 });
  }
}
