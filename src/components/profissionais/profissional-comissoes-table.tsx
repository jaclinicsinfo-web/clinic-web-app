"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BadgeCheck, CircleDollarSign, Clock } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { Comissao, ComissaoStatus } from "@/types";

function formatCompetencia(competencia: string) {
  return format(parseISO(`${competencia}-01`), "MMMM 'de' yyyy", { locale: ptBR });
}

export function ProfissionalComissoesTable({ comissoes }: { comissoes: Comissao[] }) {
  const totais = React.useMemo(() => {
    const acumular = (status: ComissaoStatus) =>
      comissoes
        .filter((comissao) => comissao.status === status)
        .reduce((total, comissao) => total + comissao.valorComissao, 0);

    return {
      prevista: acumular("prevista"),
      aprovada: acumular("aprovada"),
      paga: acumular("paga"),
    };
  }, [comissoes]);

  const columns = React.useMemo<ColumnDef<Comissao, unknown>[]>(
    () => [
      {
        id: "competencia",
        accessorFn: (row) => row.competencia,
        header: "Competência",
        cell: ({ row }) => (
          <span className="font-medium capitalize text-foreground">{formatCompetencia(row.original.competencia)}</span>
        ),
      },
      {
        id: "atendimentos",
        accessorFn: (row) => row.atendimentos,
        header: "Atendimentos",
        cell: ({ getValue }) => <span className="tabular-nums text-foreground">{getValue() as number}</span>,
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
        header: "Percentual",
        cell: ({ row }) => <span className="tabular-nums">{formatPercent(row.original.percentual, 0)}</span>,
      },
      {
        id: "valorComissao",
        accessorFn: (row) => row.valorComissao,
        header: "Comissão",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-foreground">{formatCurrency(row.original.valorComissao)}</span>
        ),
      },
      {
        id: "pagoEm",
        accessorFn: (row) => (row.pagoEm ? formatDate(row.pagoEm) : "—"),
        header: "Pago em",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="comissao" status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Comissões previstas"
          value={formatCurrency(totais.prevista)}
          icon={Clock}
          hint="Competência em aberto, sujeita a fechamento"
        />
        <StatCard
          label="Comissões aprovadas"
          value={formatCurrency(totais.aprovada)}
          icon={BadgeCheck}
          hint="Fechadas e aguardando pagamento"
        />
        <StatCard
          label="Comissões pagas"
          value={formatCurrency(totais.paga)}
          icon={CircleDollarSign}
          hint="Total já repassado ao profissional"
        />
      </div>

      <DataTable
        columns={columns}
        data={comissoes}
        searchPlaceholder="Buscar por competência..."
        exportFileName="comissoes-do-profissional"
        emptyTitle="Nenhuma comissão registrada"
        emptyDescription="Profissionais com remuneração fixa não geram extrato de comissão."
      />
    </div>
  );
}
