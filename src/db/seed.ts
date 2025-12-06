import { config } from "dotenv";
config({ path: ".env" });

import { db } from "./client";
import { profiles } from "./schema";
import { mockProfiles } from "../lib/mock-data";

async function seed() {
  // Insert mock profiles (skip if already exist)
  console.log("Adding mock profiles...");
  for (const profile of mockProfiles) {
    await db
      .insert(profiles)
      .values({
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
      })
      .onConflictDoNothing();
    console.log(`+ ${profile.name}`);
  }

  console.log("\nSeed complete! Mock profiles added (real profiles preserved)");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
