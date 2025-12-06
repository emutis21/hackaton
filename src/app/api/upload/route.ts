import { NextRequest, NextResponse } from "next/server";

import { extractTextFromPdf } from "@/lib/pdf";
import { extractProfileFromText } from "@/lib/ai";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { config } from "@/lib/config";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // AI SDK errors
    if (error.name === "AI_NoObjectGeneratedError") {
      return "No pudimos extraer la información del CV. Intenta con otro archivo.";
    }
    if (error.message.includes("Insufficient Balance")) {
      return "Servicio de AI temporalmente no disponible. Intenta más tarde.";
    }
    if (error.message.includes("rate limit")) {
      return "Demasiadas solicitudes. Espera un momento e intenta de nuevo.";
    }
    // DB errors
    if (error.message.includes("duplicate key")) {
      return "Ya existe un perfil con este email.";
    }
    if (error.message.includes("connection")) {
      return "Error de conexión a la base de datos. Intenta de nuevo.";
    }
    return error.message;
  }
  return "Error desconocido al procesar el CV";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "El archivo debe ser PDF" }, { status: 400 });
    }

    // 1. Extract text from PDF
    const buffer = await file.arrayBuffer();
    let cvText: string;
    try {
      cvText = await extractTextFromPdf(buffer);
    } catch (pdfError) {
      console.error("PDF extraction error:", pdfError);
      return NextResponse.json(
        { error: "No se pudo leer el PDF. Verifica que no esté protegido." },
        { status: 400 }
      );
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "El PDF no contiene suficiente texto. Usa un CV con más contenido." },
        { status: 400 }
      );
    }

    // 2. Extract profile data using AI
    let extractedData;
    try {
      extractedData = await extractProfileFromText(cvText);
    } catch (aiError) {
      console.error("AI extraction error:", aiError);
      return NextResponse.json(
        { error: getErrorMessage(aiError) },
        { status: 422 }
      );
    }

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
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
