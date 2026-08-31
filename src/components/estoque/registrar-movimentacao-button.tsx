"use client";

import * as React from "react";
import { ArrowDownUp } from "lucide-react";

import { MovimentacaoModal } from "@/components/estoque/movimentacao-modal";
import { Button } from "@/components/ui/button";
import type { MovimentacaoEstoque, Produto } from "@/types";

interface RegistrarMovimentacaoButtonProps {
  produtos: Produto[];
  procedimentos: { id: string; nome: string }[];
  dataPadrao: string;
  disabled?: boolean;
  onRegistrada: (resultado: { produto: Produto; movimentacao: MovimentacaoEstoque }) => void;
}

export function RegistrarMovimentacaoButton({
  produtos,
  procedimentos,
  dataPadrao,
  disabled,
  onRegistrada,
}: RegistrarMovimentacaoButtonProps) {
  const [aberto, setAberto] = React.useState(false);

  return (
    <>
      <Button onClick={() => setAberto(true)} disabled={disabled || produtos.length === 0}>
        <ArrowDownUp />
        Registrar movimentação
      </Button>

      <MovimentacaoModal
        open={aberto}
        onOpenChange={setAberto}
        produtos={produtos}
        procedimentos={procedimentos}
        dataPadrao={dataPadrao}
        onRegistrada={onRegistrada}
      />
    </>
  );
}
