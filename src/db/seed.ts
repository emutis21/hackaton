import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./client";
import { profiles, swipes, matches } from "./schema";
import { mockProfiles, mockCurrentUser } from "../lib/mock-data";

async function seed() {
  console.log("Cleaning database...");
  await db.delete(matches);
  await db.delete(swipes);
  await db.delete(profiles);

  console.log("Inserting profiles...");
  const allProfiles = [mockCurrentUser, ...mockProfiles];

  for (const profile of allProfiles) {
    await db.insert(profiles).values({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      headline: profile.headline,
      skills: profile.skills,
      experienceYears: profile.experienceYears,
      industry: profile.industry,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      pdfUrl: profile.pdfUrl,
      lookingFor: profile.lookingFor,
      offering: profile.offering,
      preferredIndustries: profile.preferredIndustries,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      isActive: profile.isActive,
      onboardingCompleted: profile.onboardingCompleted,
    });
    console.log(`+ ${profile.name}`);
  }

  // Create a match between Demo User and Maria Garcia
  const demoId = mockCurrentUser.id;
  const mariaId = mockProfiles[0].id; // Maria Garcia

  console.log("\nCreating swipes...");
  await db.insert(swipes).values({ swiperId: demoId, swipedId: mariaId, direction: "right" });
  await db.insert(swipes).values({ swiperId: mariaId, swipedId: demoId, direction: "right" });
  console.log("+ Demo User <-> Maria Garcia (mutual right swipes)");

  console.log("\nCreating match...");
  await db.insert(matches).values({ userA: demoId, userB: mariaId });
  console.log("+ Match: Demo User & Maria Garcia");

  console.log("\n--- Seed complete ---");
  console.log(`Demo user: ${demoId}`);
  console.log(`Discover: /discover?userId=${demoId}`);
  console.log(`Matches:  /matches?userId=${demoId}`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
