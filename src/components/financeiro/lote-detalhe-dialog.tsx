"use client";

import { StatusBadge } from "@/components/shared/status-badge";
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
import type { LoteConvenio } from "@/types";

interface LoteDetalheDialogProps {
  lote: LoteConvenio | null;
  onOpenChange: (open: boolean) => void;
  onConciliar: (lote: LoteConvenio) => void;
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

export function LoteDetalheDialog({ lote, onOpenChange, onConciliar }: LoteDetalheDialogProps) {
  const aReceber = lote ? Math.max(lote.valorApresentado - lote.valorGlosado - lote.valorRecebido, 0) : 0;
  const taxaGlosa = lote && lote.valorApresentado > 0 ? (lote.valorGlosado / lote.valorApresentado) * 100 : 0;

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
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button disabled={!lote || aReceber === 0} onClick={() => lote && onConciliar(lote)}>
            Conciliar recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
