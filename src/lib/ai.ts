import { generateObject } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { z } from "zod";

export const extractedProfileSchema = z.object({
  name: z.string().describe("Full name of the person"),
  headline: z.string().describe("Current job title and company, e.g. 'Senior Engineer @ Startup'"),
  skills: z.array(z.string()).describe("List of technical and professional skills"),
  experienceYears: z.number().describe("Total years of professional experience"),
  industry: z.string().describe("Primary industry or sector"),
  bio: z.string().describe("A compelling 2-3 sentence professional bio highlighting their unique value"),
  linkedinUrl: z.string().optional().describe("LinkedIn profile URL if found"),
  githubUrl: z.string().optional().describe("GitHub profile URL if found"),
  email: z.string().optional().describe("Email address if found"),
});

export type ExtractedProfile = z.infer<typeof extractedProfileSchema>;

export async function extractProfileFromText(cvText: string): Promise<ExtractedProfile> {
  const { object } = await generateObject({
    model: deepseek("deepseek-chat"),
    schema: extractedProfileSchema,
    prompt: `You are an expert at extracting professional information from CVs and resumes.

Analyze the following CV/resume text and extract the relevant information.
For the bio, create a compelling 2-3 sentence description that highlights what makes this person unique and valuable for professional networking.

CV Text:
${cvText}`,
  });

  return object;
}
