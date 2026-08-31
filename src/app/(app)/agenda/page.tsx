import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { AgendaWorkspace } from "@/components/agenda/agenda-workspace";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function AgendaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando agenda" />
        </div>
      }
    >
      <AgendaWorkspace />
    </Suspense>
  );
}
