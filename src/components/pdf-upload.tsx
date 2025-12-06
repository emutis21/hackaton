"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Profile } from "@/db/schema";

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

interface PdfUploadProps {
  onSuccess?: (profile: Profile) => void;
}

export function PdfUpload({ onSuccess }: PdfUploadProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        setError("Por favor sube un archivo PDF");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo es muy grande (máx 10MB)");
        return;
      }

      setFileName(file.name);
      setError(null);
      setStatus("uploading");
      setProgress(20);

      try {
        const formData = new FormData();
        formData.append("file", file);

        setProgress(40);
        setStatus("processing");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        setProgress(80);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Error al procesar el CV");
        }

        const data = await response.json();
        setProgress(100);
        setStatus("success");

        if (onSuccess && data.profile) {
          onSuccess(data.profile);
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    },
    [onSuccess]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        const input = document.createElement("input");
        input.type = "file";
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const resetUpload = () => {
    setStatus("idle");
    setError(null);
    setProgress(0);
    setFileName(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${status === "idle" ? "border-muted-foreground/25 hover:border-muted-foreground/50" : ""}
            ${status === "error" ? "border-destructive" : ""}
            ${status === "success" ? "border-green-500" : ""}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {status === "idle" && (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Sube tu CV o Portfolio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Arrastra tu PDF aquí o haz click para seleccionar
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <Button
                type="button"
                onClick={() => document.getElementById("pdf-upload")?.click()}
              >
                Seleccionar PDF
              </Button>
            </>
          )}

          {(status === "uploading" || status === "processing") && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <h3 className="text-lg font-semibold mb-2">
                {status === "uploading" ? "Subiendo..." : "Analizando con AI..."}
              </h3>
              {fileName && (
                <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {fileName}
                </p>
              )}
              <Progress value={progress} className="w-full" />
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">CV procesado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hemos extraído tu información profesional
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={resetUpload}>
                Intentar de nuevo
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
