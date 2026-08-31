"use client";

import * as React from "react";
import { FileCheck2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { formatCompetencia } from "@/components/financeiro/utils";
import { formatCurrency } from "@/lib/format";

interface FecharFolhaButtonProps {
  competencia: string;
  total: number;
  profissionais: number;
  onFechar: () => Promise<void> | void;
}

export function FecharFolhaButton({ competencia, total, profissionais, onFechar }: FecharFolhaButtonProps) {
  const [confirmando, setConfirmando] = React.useState(false);
  const rotuloCompetencia = formatCompetencia(competencia);

  return (
    <>
      <Button onClick={() => setConfirmando(true)}>
        <FileCheck2 />
        Fechar folha de {rotuloCompetencia}
      </Button>

      <ConfirmDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        destructive={false}
        title={`Fechar a folha de ${rotuloCompetencia}?`}
        description={`${profissionais} profissionais e ${formatCurrency(total)} em comissões serão aprovados de uma vez. Depois do fechamento, novos atendimentos da competência não entram mais neste cálculo.`}
        confirmLabel="Fechar folha"
        onConfirm={async () => {
          await onFechar();
          setConfirmando(false);
        }}
      />
    </>
  );
}
