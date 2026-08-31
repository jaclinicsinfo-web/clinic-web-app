"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Pode } from "@/components/auth/pode";
import { DataTable } from "@/components/shared/data-table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-section";
import { MoneyInput } from "@/components/shared/money-input";
import { formatCurrency, formatDate } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/status";
import { ApiError } from "@/lib/api";
import { pagarCobrancaApi } from "@/services/financeiro";
import { hojeISO } from "@/components/financeiro/utils";
import type { Cobranca, FormaPagamento } from "@/types";

export function FinanceiroPacienteTable({
  cobrancas,
  onAtualizado,
}: {
  cobrancas: Cobranca[];
  onAtualizado?: () => void;
}) {
  const [status, setStatus] = React.useState("todos");
  const [receber, setReceber] = React.useState<Cobranca | null>(null);
  const [forma, setForma] = React.useState<FormaPagamento>("pix");
  const [valor, setValor] = React.useState(0);
  const [salvando, setSalvando] = React.useState(false);

  const dados = React.useMemo(
    () => cobrancas.filter((cobranca) => status === "todos" || cobranca.status === status),
    [cobrancas, status],
  );

  const columns = React.useMemo<ColumnDef<Cobranca, unknown>[]>(
    () => [
      {
        accessorKey: "descricao",
        header: "Descrição",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.descricao}</p>
            <p className="text-xs text-muted-foreground">Venc. {formatDate(row.original.vencimento)}</p>
          </div>
        ),
      },
      {
        id: "valor",
        accessorFn: (row) => row.valor,
        header: "Valor",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.valor)}</span>,
      },
      {
        id: "forma",
        accessorFn: (row) => (row.formaPagamento ? formaPagamentoLabels[row.formaPagamento] : "—"),
        header: "Forma",
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="cobranca" status={row.original.status} />,
      },
      {
        id: "pagoEm",
        accessorFn: (row) => (row.pagoEm ? formatDate(row.pagoEm) : "—"),
        header: "Pago em",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const emAberto = row.original.status === "pendente" || row.original.status === "atrasado" || row.original.status === "parcelado";
          if (!emAberto) return null;

          return (
            <Pode modulo="financeiro" acao="criar">
              <Button
                size="sm"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  setReceber(row.original);
                  setValor(row.original.valor);
                  setForma("pix");
                }}
              >
                <CreditCard />
                Receber
              </Button>
            </Pode>
          );
        },
      },
    ],
    [],
  );

  async function confirmarRecebimento() {
    if (!receber) return;
    setSalvando(true);
    try {
      await pagarCobrancaApi(receber.id, {
        valor,
        formaPagamento: forma,
        data: hojeISO(),
      });
      toast.success("Recebimento registrado", {
        description: `${receber.descricao} · ${formatCurrency(valor)}`,
      });
      setReceber(null);
      onAtualizado?.();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível registrar o recebimento.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar cobrança..."
        exportFileName="financeiro-paciente"
        emptyTitle="Nenhuma cobrança"
        emptyDescription="Este paciente ainda não possui lançamentos financeiros."
        toolbar={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="parcelado">Parcelado</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={receber !== null} onOpenChange={(aberto) => !aberto && setReceber(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar recebimento</DialogTitle>
            <DialogDescription>{receber?.descricao}</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <FormField label="Valor recebido" required>
              <MoneyInput value={valor} onChange={setValor} />
            </FormField>

            <FormField label="Forma de pagamento" required>
              <Select value={forma} onValueChange={(valorSelecionado) => setForma(valorSelecionado as FormaPagamento)}>
                <SelectTrigger aria-label="Forma de pagamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(formaPagamentoLabels)
                    .filter(([chave]) => chave !== "convenio")
                    .map(([chave, label]) => (
                      <SelectItem key={chave} value={chave}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceber(null)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={confirmarRecebimento} loading={salvando} disabled={valor <= 0}>
              Confirmar recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
