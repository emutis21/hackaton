import { NextRequest, NextResponse } from "next/server";

import { extractTextFromPdf } from "@/lib/pdf";
import { extractProfileFromText } from "@/lib/ai";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // 1. Extract text from PDF
    const buffer = await file.arrayBuffer();
    const cvText = await extractTextFromPdf(buffer);

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
    }

    // 2. Extract profile data using AI
    const extractedData = await extractProfileFromText(cvText);

    // 3. Upload PDF to Supabase Storage (if service role key is configured)
    let pdfUrl: string | null = null;

    if (config.supabase.serviceRoleKey) {
      const supabase = createSupabaseAdminClient();
      const fileName = `${crypto.randomUUID()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, buffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // Continue without PDF storage
      } else {
        const { data: urlData } = supabase.storage.from("cvs").getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
      }
    }

    // 4. Create profile in database (use unique email to avoid conflicts)
    const uniqueEmail = extractedData.email
      ? `${extractedData.email.split('@')[0]}-${crypto.randomUUID().slice(0, 8)}@${extractedData.email.split('@')[1] || 'temp.hackaton'}`
      : `${crypto.randomUUID()}@temp.hackaton`;

    const [profile] = await db
      .insert(profiles)
      .values({
        email: uniqueEmail,
        name: extractedData.name,
        headline: extractedData.headline,
        skills: extractedData.skills,
        experienceYears: extractedData.experienceYears,
        industry: extractedData.industry,
        bio: extractedData.bio,
        linkedinUrl: extractedData.linkedinUrl,
        githubUrl: extractedData.githubUrl,
        pdfUrl,
        onboardingCompleted: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      profile,
      extracted: extractedData,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process CV" },
      { status: 500 }
    );
  }
}
