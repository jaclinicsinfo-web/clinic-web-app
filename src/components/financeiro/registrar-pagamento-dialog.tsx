"use client";

import * as React from "react";

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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/status";
import { formasPagamento, hojeISO } from "@/components/financeiro/utils";
import type { FormaPagamento } from "@/types";

export interface PagamentoRegistrado {
  valor: number;
  formaPagamento: FormaPagamento;
  data: string;
  observacoes: string;
}

interface RegistrarPagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Resumo do lançamento que está recebendo a baixa. */
  lancamento?: { titulo: string; subtitulo?: string; vencimento: string; valor: number } | null;
  valorSugerido: number;
  formaSugerida?: FormaPagamento | null;
  dataLabel?: string;
  confirmLabel?: string;
  onConfirm: (pagamento: PagamentoRegistrado) => void;
}

export function RegistrarPagamentoDialog({
  open,
  onOpenChange,
  title,
  description,
  lancamento,
  valorSugerido,
  formaSugerida,
  dataLabel = "Data do recebimento",
  confirmLabel = "Registrar pagamento",
  onConfirm,
}: RegistrarPagamentoDialogProps) {
  const [valor, setValor] = React.useState(valorSugerido);
  const [forma, setForma] = React.useState<FormaPagamento>(formaSugerida ?? "pix");
  const [data, setData] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setValor(valorSugerido);
    setForma(formaSugerida ?? "pix");
    setData(hojeISO());
    setObservacoes("");
  }, [open, valorSugerido, formaSugerida]);

  const diferenca = lancamento ? valor - lancamento.valor : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          {lancamento && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">{lancamento.titulo}</p>
              {lancamento.subtitulo && (
                <p className="mt-0.5 text-xs text-muted-foreground">{lancamento.subtitulo}</p>
              )}
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Vencimento em {formatDate(lancamento.vencimento)}
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(lancamento.valor)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Valor recebido" htmlFor="pagamento-valor" required>
              <MoneyInput id="pagamento-valor" value={valor} onChange={setValor} />
            </FormField>

            <FormField label={dataLabel} htmlFor="pagamento-data" required>
              <Input
                id="pagamento-data"
                type="date"
                value={data}
                onChange={(event) => setData(event.target.value)}
              />
            </FormField>

            <FormField label="Forma de pagamento" required full>
              <Select value={forma} onValueChange={(valorSelecionado) => setForma(valorSelecionado as FormaPagamento)}>
                <SelectTrigger aria-label="Forma de pagamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map((item) => (
                    <SelectItem key={item} value={item}>
                      {formaPagamentoLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Observações"
              htmlFor="pagamento-observacoes"
              full
              hint={
                diferenca !== 0
                  ? `Baixa parcial ou com acréscimo: diferença de ${formatCurrency(Math.abs(diferenca))} em relação ao valor original.`
                  : undefined
              }
            >
              <Textarea
                id="pagamento-observacoes"
                rows={3}
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                placeholder="Número do comprovante, maquininha utilizada, acordo de desconto..."
              />
            </FormField>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={valor <= 0 || data === ""}
            onClick={() => onConfirm({ valor, formaPagamento: forma, data, observacoes })}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
