import Link from "next/link";
import { ArrowRight, Upload, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Conecta con gente innovadora
        </h1>

        <p className="text-xl text-muted-foreground">
          Sin formularios. Sin fricción. Solo sube tu CV y empieza a hacer networking.
        </p>

        <div className="flex justify-center pt-4">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/onboarding">
              Empezar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Sube tu CV</h3>
            <p className="text-sm text-muted-foreground">
              PDF de tu CV o portfolio
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">AI extrae tu perfil</h3>
            <p className="text-sm text-muted-foreground">
              Creamos tu perfil automáticamente
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Conecta</h3>
            <p className="text-sm text-muted-foreground">
              Swipe y haz match con otros
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
