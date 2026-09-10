"use client";

import { Toaster } from "sonner";

import { useTema } from "@/hooks/use-tema";

export function ThemedToaster() {
  const { tema } = useTema();

  return <Toaster position="top-right" richColors closeButton theme={tema === "escuro" ? "dark" : "light"} />;
}
