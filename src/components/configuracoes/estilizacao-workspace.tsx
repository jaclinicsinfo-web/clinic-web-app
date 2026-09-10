"use client";

import { Check, Moon, Sun } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { useTema } from "@/hooks/use-tema";
import { cn } from "@/lib/utils";
import type { TemaSistema } from "@/lib/tema";

const opcoes: {
  id: TemaSistema;
  titulo: string;
  descricao: string;
  icone: typeof Sun;
}[] = [
  {
    id: "claro",
    titulo: "Claro",
    descricao: "O tema atual do sistema, com fundo claro e barra lateral em teal.",
    icone: Sun,
  },
  {
    id: "escuro",
    titulo: "Escuro",
    descricao: "Superfícies escuras no padrão TailAdmin, com cards elevados e gráficos em alto contraste.",
    icone: Moon,
  },
];

export function EstilizacaoWorkspace() {
  const { tema, setTema } = useTema();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estilização"
        description="Escolha o tema visual do sistema. A preferência é salva na sua conta e vale em qualquer dispositivo."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {opcoes.map((opcao) => {
          const selecionado = tema === opcao.id;
          const Icone = opcao.icone;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setTema(opcao.id)}
              aria-pressed={selecionado}
              className={cn(
                "group relative overflow-hidden rounded-xl border text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                selecionado
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40",
              )}
            >
              <PreviewTema tema={opcao.id} />

              <div className="flex items-start gap-3 bg-card px-5 py-4">
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    selecionado ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icone className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{opcao.titulo}</p>
                    {selecionado && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                        <Check className="size-3" />
                        Em uso
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{opcao.descricao}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreviewTema({ tema }: { tema: TemaSistema }) {
  const escuro = tema === "escuro";
  const fundo = escuro ? "#101828" : "#f6f7f9";
  const card = escuro ? "#1a2231" : "#ffffff";
  const sidebar = escuro ? "#1a2236" : "#0c3f4a";
  const texto = escuro ? "#f2f4f7" : "#0f1a24";
  const muted = escuro ? "#98a2b3" : "#5c6b7a";
  const barra = escuro ? "#465fff" : "#0d5c6b";
  const barra2 = escuro ? "#12b76a" : "#2a9d8f";
  const grade = escuro ? "#344054" : "#e2e6ec";
  const ativo = escuro ? "#2a3a54" : "#10525f";

  return (
    <div className="pointer-events-none p-4" style={{ background: fundo }} aria-hidden>
      <div className="overflow-hidden rounded-lg border" style={{ borderColor: grade }}>
        <div className="flex h-36">
          <div className="flex w-[72px] shrink-0 flex-col gap-1.5 p-2" style={{ background: sidebar }}>
            <div className="mb-1 h-2.5 w-10 rounded-sm bg-white/80" />
            <div className="h-2 w-full rounded-sm" style={{ background: ativo }} />
            <div className="h-2 w-8 rounded-sm bg-white/25" />
            <div className="h-2 w-9 rounded-sm bg-white/25" />
            <div className="mt-auto h-2 w-7 rounded-sm bg-white/20" />
          </div>
          <div className="min-w-0 flex-1 p-2.5">
            <div className="mb-2 h-2.5 w-16 rounded-sm" style={{ background: texto, opacity: 0.85 }} />
            <div className="h-[92px] rounded-md p-2" style={{ background: card, boxShadow: "0 1px 2px rgb(0 0 0 / 0.08)" }}>
              <div className="mb-2 h-2 w-12 rounded-sm" style={{ background: muted }} />
              <div className="flex h-14 items-end gap-1 px-0.5">
                {[40, 70, 55, 88, 62, 78, 45].map((altura, index) => (
                  <div
                    key={index}
                    className="min-w-0 flex-1 rounded-t-sm"
                    style={{ height: `${altura}%`, background: index % 2 === 0 ? barra : barra2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
