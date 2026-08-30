"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Layers, MoreHorizontal, UserRound } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParcelasDialog } from "@/components/financeiro/parcelas-dialog";
import { RegistrarPagamentoDialog } from "@/components/financeiro/registrar-pagamento-dialog";
import { formasPagamento } from "@/components/financeiro/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/status";
import { getConvenioNome } from "@/services/catalogo";
import type { Cobranca } from "@/types";

interface ContasAReceberTableProps {
  cobrancas: Cobranca[];
  convenios: { id: string; nome: string }[];
}

export function ContasAReceberTable({ cobrancas, convenios }: ContasAReceberTableProps) {
  const [status, setStatus] = React.useState("todos");
  const [origem, setOrigem] = React.useState("todas");
  const [forma, setForma] = React.useState("todas");
  const [recebendo, setRecebendo] = React.useState<Cobranca | null>(null);
  const [detalhando, setDetalhando] = React.useState<Cobranca | null>(null);

  const dados = React.useMemo(() => {
    return cobrancas.filter((cobranca) => {
      if (status !== "todos" && cobranca.status !== status) return false;
      if (origem === "particular" && cobranca.convenioId) return false;
      if (origem === "convenio" && !cobranca.convenioId) return false;
      if (origem !== "todas" && origem !== "particular" && origem !== "convenio" && cobranca.convenioId !== origem) {
        return false;
      }
      if (forma !== "todas" && cobranca.formaPagamento !== forma) return false;
      return true;
    });
  }, [cobrancas, status, origem, forma]);

  const columns = React.useMemo<ColumnDef<Cobranca, unknown>[]>(
    () => [
      {
        accessorKey: "pacienteNome",
        header: "Paciente",
        cell: ({ row }) => {
          const cobranca = row.original;
          return (
            <div className="min-w-0">
              <Link
                href={`/pacientes/${cobranca.pacienteId}`}
                className="block truncate font-medium text-foreground hover:text-primary hover:underline"
              >
                {cobranca.pacienteNome}
              </Link>
              <p className="text-xs text-muted-foreground">{getConvenioNome(cobranca.convenioId)}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "descricao",
        header: "Descrição",
        cell: ({ row }) => {
          const cobranca = row.original;
          const pagas = cobranca.parcelas.filter((parcela) => parcela.status === "pago").length;
          return (
            <div className="min-w-0">
              <p className="truncate text-foreground">{cobranca.descricao}</p>
              {cobranca.parcelas.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {cobranca.parcelas.length} parcelas · {pagas} paga{pagas === 1 ? "" : "s"}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "valor",
        accessorFn: (row) => row.valor,
        header: "Valor",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-foreground">{formatCurrency(row.original.valor)}</span>
        ),
      },
      {
        id: "vencimento",
        accessorFn: (row) => formatDate(row.vencimento),
        header: "Vencimento",
        sortingFn: (a, b) => a.original.vencimento.localeCompare(b.original.vencimento),
        cell: ({ row }) => {
          const cobranca = row.original;
          return (
            <span
              className={
                cobranca.status === "atrasado"
                  ? "font-medium tabular-nums text-danger"
                  : "tabular-nums text-muted-foreground"
              }
            >
              {formatDate(cobranca.vencimento)}
            </span>
          );
        },
      },
      {
        id: "formaPagamento",
        accessorFn: (row) => (row.formaPagamento ? formaPagamentoLabels[row.formaPagamento] : "Não definida"),
        header: "Forma de pagamento",
        cell: ({ getValue }) => {
          const rotulo = getValue() as string;
          return rotulo === "Não definida" ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <Badge tone="outline">{rotulo}</Badge>
          );
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="cobranca" status={row.original.status} />,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false,
        size: 56,
        cell: ({ row }) => {
          const cobranca = row.original;
          const quitada = cobranca.status === "pago" || cobranca.status === "cancelado";

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Ações da cobrança de ${cobranca.pacienteNome}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={quitada} onSelect={() => setRecebendo(cobranca)}>
                    <CreditCard />
                    Registrar pagamento
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={cobranca.parcelas.length === 0}
                    onSelect={() => setDetalhando(cobranca)}
                  >
                    <Layers />
                    Ver parcelas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/pacientes/${cobranca.pacienteId}`}>
                      <UserRound />
                      Ver paciente
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por paciente ou descrição..."
        exportFileName="contas-a-receber"
        pageSize={12}
        emptyTitle="Nenhuma cobrança encontrada"
        emptyDescription="Ajuste os filtros de status, origem ou forma de pagamento."
        toolbar={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="pago">Pagas</SelectItem>
                <SelectItem value="atrasado">Atrasadas</SelectItem>
                <SelectItem value="parcelado">Parceladas</SelectItem>
                <SelectItem value="cancelado">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={origem} onValueChange={setOrigem}>
              <SelectTrigger className="w-40" aria-label="Filtrar por convênio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda origem</SelectItem>
                <SelectItem value="particular">Particular</SelectItem>
                <SelectItem value="convenio">Todos os convênios</SelectItem>
                {convenios.map((convenio) => (
                  <SelectItem key={convenio.id} value={convenio.id}>
                    {convenio.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={forma} onValueChange={setForma}>
              <SelectTrigger className="w-44" aria-label="Filtrar por forma de pagamento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda forma</SelectItem>
                {formasPagamento.map((item) => (
                  <SelectItem key={item} value={item}>
                    {formaPagamentoLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <RegistrarPagamentoDialog
        open={Boolean(recebendo)}
        onOpenChange={(aberto) => !aberto && setRecebendo(null)}
        title="Registrar recebimento"
        description="Dê baixa na cobrança informando o valor efetivamente recebido."
        lancamento={
          recebendo
            ? {
                titulo: recebendo.pacienteNome,
                subtitulo: `${recebendo.descricao} · ${getConvenioNome(recebendo.convenioId)}`,
                vencimento: recebendo.vencimento,
                valor: recebendo.valor,
              }
            : null
        }
        valorSugerido={recebendo?.valor ?? 0}
        formaSugerida={recebendo?.formaPagamento ?? null}
        onConfirm={(pagamento) => {
          toast.success("Pagamento registrado", {
            description: `${recebendo?.pacienteNome ?? ""} · ${formatCurrency(pagamento.valor)} em ${formaPagamentoLabels[pagamento.formaPagamento]}`,
          });
          setRecebendo(null);
        }}
      />

      <ParcelasDialog cobranca={detalhando} onOpenChange={(aberto) => !aberto && setDetalhando(null)} />
    </>
  );
}
