import { Suspense } from "react";

import { Sidebar, SidebarSkeleton } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
