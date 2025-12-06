import Link from "next/link";
import { Compass, Users, LogOut } from "lucide-react";

import { getSessionUserId } from "@/lib/session";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

async function UserProfile() {
  const userId = await getSessionUserId();

  if (!userId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">No has iniciado sesion</p>
        <Button asChild size="sm" className="mt-2">
          <Link href="/onboarding">Crear perfil</Link>
        </Button>
      </div>
    );
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Perfil no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
          {profile.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{profile.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {profile.headline || profile.industry}
          </p>
        </div>
      </div>
      {profile.skills && profile.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {profile.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 bg-muted rounded-full"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{profile.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function NavLinks() {
  return (
    <nav className="flex-1 p-2">
      <Link
        href="/discover"
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Compass className="w-5 h-5" />
        <span>Descubrir</span>
      </Link>
      <Link
        href="/matches"
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Users className="w-5 h-5" />
        <span>Matches</span>
      </Link>
    </nav>
  );
}

function LogoutButton() {
  return (
    <form action="/api/session" method="DELETE" className="p-2 border-t">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-3"
        type="submit"
        formAction={async () => {
          "use server";
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          cookieStore.delete("hackaton_user_id");
        }}
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar sesion</span>
      </Button>
    </form>
  );
}

export async function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b">
        <Link href="/" className="text-xl font-bold">
          hackaton
        </Link>
      </div>
      <UserProfile />
      <NavLinks />
      <LogoutButton />
    </aside>
  );
}
