"use client";

import * as React from "react";
import { CalendarPlus, Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { formatDateTime, formatPhone } from "@/lib/format";
import { criarEsperaApi } from "@/services/agenda";
import type { ListaEsperaItem } from "@/types";

import { preferenciaPeriodoLabels } from "./agenda-utils";

interface ListaEsperaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itens: ListaEsperaItem[];
  pacientes: { id: string; nome: string }[];
  profissionais: { id: string; nome: string }[];
  procedimentos: { id: string; nome: string }[];
  onEncaixar: (item: ListaEsperaItem) => void;
  onCriado: (item: ListaEsperaItem) => void;
}

export function ListaEsperaDialog({
  open,
  onOpenChange,
  itens,
  pacientes,
  profissionais,
  procedimentos,
  onEncaixar,
  onCriado,
}: ListaEsperaDialogProps) {
  const [pacienteId, setPacienteId] = React.useState("");
  const [profissionalId, setProfissionalId] = React.useState("qualquer");
  const [procedimentoId, setProcedimentoId] = React.useState("nenhum");
  const [periodo, setPeriodo] = React.useState<ListaEsperaItem["preferenciaPeriodo"]>("qualquer");
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setPacienteId("");
    setProfissionalId("qualquer");
    setProcedimentoId("nenhum");
    setPeriodo("qualquer");
  }, [open]);

  async function adicionar() {
    if (!pacienteId) {
      toast.error("Selecione o paciente para a lista de espera.");
      return;
    }
    setSalvando(true);
    try {
      const item = await criarEsperaApi({
        pacienteId,
        profissionalId: profissionalId === "qualquer" ? null : profissionalId,
        procedimentoId: procedimentoId === "nenhum" ? null : procedimentoId,
        preferenciaPeriodo: periodo,
      });
      onCriado(item);
      setPacienteId("");
      toast.success("Paciente incluído na lista de espera");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível incluir na lista de espera.");
    } finally {
      setSalvando(false);
    }
  }

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

          <div className="space-y-3 border-t border-border px-6 py-4">
            <p className="text-sm font-medium text-foreground">Incluir na espera</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Paciente" required>
                <Select value={pacienteId} onValueChange={setPacienteId}>
                  <SelectTrigger aria-label="Paciente da lista de espera">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id}>
                        {paciente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Período">
                <Select value={periodo} onValueChange={(valor) => setPeriodo(valor as ListaEsperaItem["preferenciaPeriodo"])}>
                  <SelectTrigger aria-label="Período preferido">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualquer">Qualquer</SelectItem>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Profissional">
                <Select value={profissionalId} onValueChange={setProfissionalId}>
                  <SelectTrigger aria-label="Profissional preferido">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualquer">Qualquer</SelectItem>
                    {profissionais.map((profissional) => (
                      <SelectItem key={profissional.id} value={profissional.id}>
                        {profissional.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Procedimento">
                <Select value={procedimentoId} onValueChange={setProcedimentoId}>
                  <SelectTrigger aria-label="Procedimento da espera">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">A definir</SelectItem>
                    {procedimentos.map((procedimento) => (
                      <SelectItem key={procedimento.id} value={procedimento.id}>
                        {procedimento.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <Button onClick={() => void adicionar()} loading={salvando} disabled={!pacienteId}>
              <Plus />
              Adicionar à espera
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
