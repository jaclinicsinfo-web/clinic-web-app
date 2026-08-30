"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, Banknote, MoreHorizontal, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCompetencia } from "@/components/financeiro/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { Comissao } from "@/types";

interface ComissoesTableProps {
  comissoes: Comissao[];
  competencias: string[];
}

type AcaoComissao = { comissao: Comissao; tipo: "aprovar" | "pagar" };

export function ComissoesTable({ comissoes, competencias }: ComissoesTableProps) {
  const [competencia, setCompetencia] = React.useState("todas");
  const [status, setStatus] = React.useState("todos");
  const [acao, setAcao] = React.useState<AcaoComissao | null>(null);

  const dados = React.useMemo(() => {
    return comissoes.filter((comissao) => {
      if (competencia !== "todas" && comissao.competencia !== competencia) return false;
      if (status !== "todos" && comissao.status !== status) return false;
      return true;
    });
  }, [comissoes, competencia, status]);

  const columns = React.useMemo<ColumnDef<Comissao, unknown>[]>(
    () => [
      {
        accessorKey: "profissionalNome",
        header: "Profissional",
        cell: ({ row }) => (
          <Link
            href={`/profissionais/${row.original.profissionalId}`}
            className="block truncate font-medium text-foreground hover:text-primary hover:underline"
          >
            {row.original.profissionalNome}
          </Link>
        ),
      },
      {
        id: "competencia",
        accessorFn: (row) => formatCompetencia(row.competencia),
        header: "Competência",
        sortingFn: (a, b) => a.original.competencia.localeCompare(b.original.competencia),
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "atendimentos",
        accessorFn: (row) => row.atendimentos,
        header: "Atendimentos",
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.atendimentos)}</span>,
      },
      {
        id: "faturamentoGerado",
        accessorFn: (row) => row.faturamentoGerado,
        header: "Faturamento gerado",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{formatCurrency(row.original.faturamentoGerado)}</span>
        ),
      },
      {
        id: "percentual",
        accessorFn: (row) => row.percentual,
        header: "Comissão",
        cell: ({ row }) => <span className="tabular-nums">{formatPercent(row.original.percentual, 0)}</span>,
      },
      {
        id: "valorComissao",
        accessorFn: (row) => row.valorComissao,
        header: "Valor a pagar",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-foreground">{formatCurrency(row.original.valorComissao)}</span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="comissao" status={row.original.status} />,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false,
        size: 56,
        cell: ({ row }) => {
          const comissao = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Ações da comissão de ${comissao.profissionalNome}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={comissao.status !== "prevista"}
                    onSelect={() => setAcao({ comissao, tipo: "aprovar" })}
                  >
                    <BadgeCheck />
                    Aprovar comissão
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={comissao.status !== "aprovada"}
                    onSelect={() => setAcao({ comissao, tipo: "pagar" })}
                  >
                    <Banknote />
                    Registrar pagamento
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profissionais/${comissao.profissionalId}`}>
                      <Stethoscope />
                      Ver profissional
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

  const aprovando = acao?.tipo === "aprovar";

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por profissional..."
        exportFileName="comissoes"
        pageSize={12}
        emptyTitle="Nenhuma comissão encontrada"
        emptyDescription="Ajuste os filtros de competência ou status para ver outros lançamentos."
        toolbar={
          <>
            <Select value={competencia} onValueChange={setCompetencia}>
              <SelectTrigger className="w-40" aria-label="Filtrar por competência">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda competência</SelectItem>
                {competencias.map((item) => (
                  <SelectItem key={item} value={item}>
                    {formatCompetencia(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                <SelectItem value="prevista">Previstas</SelectItem>
                <SelectItem value="aprovada">Aprovadas</SelectItem>
                <SelectItem value="paga">Pagas</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(acao)}
        onOpenChange={(aberto) => !aberto && setAcao(null)}
        destructive={false}
        title={aprovando ? "Aprovar comissão?" : "Registrar pagamento da comissão?"}
        description={
          acao
            ? `${acao.comissao.profissionalNome} · ${formatCompetencia(acao.comissao.competencia)} · ${formatCurrency(acao.comissao.valorComissao)}. ${
                aprovando
                  ? "A comissão passa a compor a folha aprovada do período."
                  : "O valor será marcado como pago e sairá da folha em aberto."
              }`
            : ""
        }
        confirmLabel={aprovando ? "Aprovar" : "Registrar pagamento"}
        onConfirm={() => {
          toast.success(aprovando ? "Comissão aprovada" : "Pagamento registrado", {
            description: `${acao?.comissao.profissionalNome ?? ""} · ${formatCurrency(acao?.comissao.valorComissao ?? 0)}`,
          });
          setAcao(null);
        }}
      />
    </>
  );
}
