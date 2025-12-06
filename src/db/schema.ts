import { pgTable, uuid, text, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";

// Profiles table - main user data extracted from CV
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  headline: text("headline"), // "Senior Engineer @ Startup"
  skills: text("skills").array(), // ["React", "Node.js", "AI/ML"]
  experienceYears: integer("experience_years"),
  industry: text("industry"),
  bio: text("bio"), // AI-generated bio
  avatarUrl: text("avatar_url"),
  pdfUrl: text("pdf_url"), // URL to uploaded PDF in storage

  // Onboarding questions
  lookingFor: text("looking_for"), // cofounder | mentor | networking | investment
  offering: text("offering"), // tech | business | capital | connections
  preferredIndustries: text("preferred_industries").array(),

  // Contact info extracted
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),

  // Status
  isActive: boolean("is_active").default(true),
  onboardingCompleted: boolean("onboarding_completed").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Swipes table - track who swiped who
export const swipes = pgTable("swipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  swiperId: uuid("swiper_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  swipedId: uuid("swiped_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(), // "left" | "right"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matches table - when both users swipe right
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userA: uuid("user_a").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  userB: uuid("user_b").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Swipe = typeof swipes.$inferSelect;
export type NewSwipe = typeof swipes.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
