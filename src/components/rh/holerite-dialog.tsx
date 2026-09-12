"use client";

import * as React from "react";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { enviarHoleriteApi } from "@/services/rh";
import type { Holerite, UsuarioRh } from "@/types";

interface HoleriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarios: UsuarioRh[];
  competencia: string;
  onSalvo: (holerite: Holerite) => void;
}

export function HoleriteDialog({ open, onOpenChange, usuarios, competencia, onSalvo }: HoleriteDialogProps) {
  const [usuarioId, setUsuarioId] = React.useState("");
  const [competenciaValor, setCompetenciaValor] = React.useState(competencia);
  const [arquivo, setArquivo] = React.useState<File | null>(null);
  const [enviando, setEnviando] = React.useState(false);
  const ativos = usuarios.filter((item) => item.status === "ativo");

  React.useEffect(() => {
    if (!open) return;
    setUsuarioId("");
    setCompetenciaValor(competencia);
    setArquivo(null);
  }, [open, competencia]);

  async function enviar() {
    if (!usuarioId) {
      toast.error("Selecione o usuário.");
      return;
    }
    if (!competenciaValor) {
      toast.error("Informe a competência.");
      return;
    }
    if (!arquivo) {
      toast.error("Selecione um arquivo PDF, JPG ou PNG.");
      return;
    }

    setEnviando(true);
    try {
      const salvo = await enviarHoleriteApi(usuarioId, competenciaValor, arquivo);
      onSalvo(salvo);
      toast.success("Holerite enviado", { description: salvo.usuarioNome });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível enviar o holerite.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar holerite</DialogTitle>
          <DialogDescription>Anexe o contracheque do usuário na competência escolhida. Um arquivo por mês.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <FormField label="Usuário" required>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger aria-label="Usuário">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ativos.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Competência" htmlFor="holerite-comp" required>
            <Input
              id="holerite-comp"
              type="month"
              value={competenciaValor}
              onChange={(event) => setCompetenciaValor(event.target.value)}
            />
          </FormField>
          <FormField label="Arquivo" htmlFor="holerite-arquivo" hint="PDF, JPG ou PNG de até 10 MB." required>
            <Input
              id="holerite-arquivo"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(event) => setArquivo(event.target.files?.[0] ?? null)}
            />
          </FormField>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void enviar()} loading={enviando}>
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
