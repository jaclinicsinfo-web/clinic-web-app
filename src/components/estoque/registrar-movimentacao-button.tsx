"use client";

import * as React from "react";
import { ArrowDownUp } from "lucide-react";

import { MovimentacaoModal } from "@/components/estoque/movimentacao-modal";
import { Button } from "@/components/ui/button";
import type { Produto } from "@/types";

interface RegistrarMovimentacaoButtonProps {
  produtos: Produto[];
  dataPadrao: string;
}

export function RegistrarMovimentacaoButton({ produtos, dataPadrao }: RegistrarMovimentacaoButtonProps) {
  const [aberto, setAberto] = React.useState(false);

  return (
    <>
      <Button onClick={() => setAberto(true)}>
        <ArrowDownUp />
        Registrar movimentação
      </Button>

      <MovimentacaoModal open={aberto} onOpenChange={setAberto} produtos={produtos} dataPadrao={dataPadrao} />
    </>
  );
}
