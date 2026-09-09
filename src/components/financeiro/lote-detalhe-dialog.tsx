"use client";

import * as React from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { FormField } from "@/components/shared/form-section";
import { MoneyInput } from "@/components/shared/money-input";
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
import { formatCompetencia } from "@/components/financeiro/utils";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/format";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import type { LoteConvenio } from "@/types";

interface LoteDetalheDialogProps {
  lote: LoteConvenio | null;
  onOpenChange: (open: boolean) => void;
  onEnviar: (lote: LoteConvenio) => Promise<void> | void;
  onConciliar: (lote: LoteConvenio, valorGlosado: number, valorRecebido: number) => Promise<void> | void;
}

function LinhaResumo({ label, valor, tone }: { label: string; valor: string; tone?: "success" | "danger" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          tone === "success"
            ? "text-sm font-medium tabular-nums text-success"
            : tone === "danger"
              ? "text-sm font-medium tabular-nums text-danger"
              : "text-sm font-medium tabular-nums text-foreground"
        }
      >
        {valor}
      </span>
    </div>
  );
}

export function LoteDetalheDialog({ lote, onOpenChange, onEnviar, onConciliar }: LoteDetalheDialogProps) {
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const podeEditar = temPermissao(permissoes, "financeiro", "editar");
  const aReceber = lote ? Math.max(lote.valorApresentado - lote.valorGlosado - lote.valorRecebido, 0) : 0;
  const taxaGlosa = lote && lote.valorApresentado > 0 ? (lote.valorGlosado / lote.valorApresentado) * 100 : 0;
  const [glosado, setGlosado] = React.useState(0);
  const [recebido, setRecebido] = React.useState(0);
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (!lote) return;
    setGlosado(lote.valorGlosado);
    setRecebido(lote.valorRecebido > 0 ? lote.valorRecebido : Math.max(lote.valorApresentado - lote.valorGlosado, 0));
  }, [lote]);

  async function enviar() {
    if (!lote) return;
    setSalvando(true);
    try {
      await onEnviar(lote);
    } finally {
      setSalvando(false);
    }
  }

  async function conciliar() {
    if (!lote) return;
    setSalvando(true);
    try {
      await onConciliar(lote, glosado, recebido);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={Boolean(lote)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reconciliação do lote</DialogTitle>
          <DialogDescription>
            {lote ? `${lote.convenioNome} · competência ${formatCompetencia(lote.competencia)}` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          {lote && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge domain="lote" status={lote.status} />
                <span className="text-sm text-muted-foreground">
                  {formatNumber(lote.quantidadeGuias)} guias no lote
                </span>
              </div>

              <div className="divide-y divide-border rounded-lg border border-border px-4">
                <LinhaResumo label="Valor apresentado" valor={formatCurrency(lote.valorApresentado)} />
                <LinhaResumo
                  label={`Glosas (${formatPercent(taxaGlosa)})`}
                  valor={`- ${formatCurrency(lote.valorGlosado)}`}
                  tone="danger"
                />
                <LinhaResumo label="Valor recebido" valor={formatCurrency(lote.valorRecebido)} tone="success" />
                <LinhaResumo label="Saldo a reconciliar" valor={formatCurrency(aReceber)} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Envio do lote</p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                    {lote.enviadoEm ? formatDate(lote.enviadoEm) : "Ainda não enviado"}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Previsão de pagamento</p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                    {lote.previsaoPagamento ? formatDate(lote.previsaoPagamento) : "—"}
                  </p>
                </div>
              </div>

              {podeEditar && (lote.status === "enviado" || lote.status === "parcial") ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Valor glosado">
                    <MoneyInput value={glosado} onChange={setGlosado} />
                  </FormField>
                  <FormField label="Valor recebido">
                    <MoneyInput value={recebido} onChange={setRecebido} />
                  </FormField>
                </div>
              ) : null}
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {podeEditar && lote?.status === "aberto" ? (
            <Button loading={salvando} onClick={() => void enviar()}>
              Enviar lote
            </Button>
          ) : podeEditar ? (
            <Button
              disabled={!lote || lote.status === "pago" || lote.status === "glosado"}
              loading={salvando}
              onClick={() => void conciliar()}
            >
              Conciliar recebimento
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
