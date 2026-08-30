"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/status";
import type { Cobranca } from "@/types";

interface ParcelasDialogProps {
  cobranca: Cobranca | null;
  onOpenChange: (open: boolean) => void;
}

export function ParcelasDialog({ cobranca, onOpenChange }: ParcelasDialogProps) {
  const parcelas = cobranca?.parcelas ?? [];
  const pago = parcelas
    .filter((parcela) => parcela.status === "pago")
    .reduce((total, parcela) => total + parcela.valor, 0);
  const emAberto = parcelas
    .filter((parcela) => parcela.status !== "pago")
    .reduce((total, parcela) => total + parcela.valor, 0);

  return (
    <Dialog open={Boolean(cobranca)} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Parcelamento</DialogTitle>
          <DialogDescription>
            {cobranca ? `${cobranca.pacienteNome} · ${cobranca.descricao}` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Valor total</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(cobranca?.valor ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Já recebido</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-success">{formatCurrency(pago)}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Em aberto</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-danger">{formatCurrency(emAberto)}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Parcela</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcelas.map((parcela) => (
                  <TableRow key={parcela.numero}>
                    <TableCell className="font-medium">
                      {parcela.numero}/{parcelas.length}
                    </TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(parcela.valor)}</TableCell>
                    <TableCell className="tabular-nums">{formatDate(parcela.vencimento)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {parcela.pagoEm ? formatDate(parcela.pagoEm) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge domain="parcela" status={parcela.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {cobranca?.formaPagamento && (
            <p className="text-xs text-muted-foreground">
              Forma de pagamento acordada: {formaPagamentoLabels[cobranca.formaPagamento]}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
