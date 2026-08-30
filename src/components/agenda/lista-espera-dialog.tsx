"use client";

import * as React from "react";
import { CalendarPlus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime, formatPhone } from "@/lib/format";
import type { ListaEsperaItem } from "@/types";

import { preferenciaPeriodoLabels } from "./agenda-utils";

interface ListaEsperaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itens: ListaEsperaItem[];
  profissionais: { id: string; nome: string }[];
  onEncaixar: (item: ListaEsperaItem) => void;
}

export function ListaEsperaDialog({
  open,
  onOpenChange,
  itens,
  profissionais,
  onEncaixar,
}: ListaEsperaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Lista de espera</DialogTitle>
          <DialogDescription>Pacientes aguardando encaixe quando houver horário livre.</DialogDescription>
        </DialogHeader>
        <DialogBody className="px-0 py-0">
          {itens.length === 0 ? (
            <EmptyState
              title="Lista de espera vazia"
              description="Quando a agenda lotar, adicione pacientes aqui para encaixes."
            />
          ) : (
            <ul className="divide-y divide-border">
              {itens.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.pacienteNome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.procedimentoNome} · {preferenciaPeriodoLabels[item.preferenciaPeriodo]}
                      {item.profissionalId
                        ? ` · ${profissionais.find((profissional) => profissional.id === item.profissionalId)?.nome ?? ""}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      {formatPhone(item.telefone)} · desde {formatDateTime(item.criadoEm)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onEncaixar(item)}>
                    <CalendarPlus />
                    Encaixar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
