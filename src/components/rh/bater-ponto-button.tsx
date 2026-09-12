"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";

import { tipoBatidaLabels } from "@/components/rh/labels";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { baterPontoApi } from "@/services/rh";
import type { RegistroPonto, TipoBatida } from "@/types";

function proximoTipo(registro?: RegistroPonto | null): TipoBatida | null {
  if (!registro?.entrada) return "entrada";
  if (!registro.saidaIntervalo && !registro.saida) return "saida_intervalo";
  if (registro.saidaIntervalo && !registro.retornoIntervalo && !registro.saida) return "retorno_intervalo";
  if (!registro.saida) return "saida";
  return null;
}

interface BaterPontoButtonProps {
  registroHoje?: RegistroPonto | null;
  onRegistrado: (registro: RegistroPonto) => void;
}

export function BaterPontoButton({ registroHoje, onRegistrado }: BaterPontoButtonProps) {
  const [enviando, setEnviando] = React.useState(false);
  const tipo = proximoTipo(registroHoje);

  async function bater() {
    if (!tipo) {
      toast.error("O ponto de hoje já está completo.");
      return;
    }
    setEnviando(true);
    try {
      const registro = await baterPontoApi(tipo);
      onRegistrado(registro);
      const hora = registro[tipo === "saida_intervalo" ? "saidaIntervalo" : tipo === "retorno_intervalo" ? "retornoIntervalo" : tipo];
      toast.success(`${tipoBatidaLabels[tipo]} registrada`, {
        description: hora ? `Horário ${hora}` : registro.usuarioNome,
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível bater o ponto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Button onClick={() => void bater()} loading={enviando} disabled={!tipo}>
      <Clock />
      {tipo ? `Bater ${tipoBatidaLabels[tipo].toLowerCase()}` : "Ponto completo"}
    </Button>
  );
}
