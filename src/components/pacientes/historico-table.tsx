"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { isAfter, parseISO, subDays, subMonths } from "date-fns";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Agendamento } from "@/types";

function origemAgendamento(agendamento: Agendamento) {
  if (agendamento.particular) return "Particular";
  return agendamento.convenioNome ?? (agendamento.convenioId ? "Convênio" : "Particular");
}

type Periodo = "todos" | "30d" | "6m" | "12m";

export function HistoricoTable({ agendamentos }: { agendamentos: Agendamento[] }) {
  const [status, setStatus] = React.useState("todos");
  const [periodo, setPeriodo] = React.useState<Periodo>("todos");

  const dados = React.useMemo(() => {
    const limite =
      periodo === "30d"
        ? subDays(new Date(), 30)
        : periodo === "6m"
          ? subMonths(new Date(), 6)
          : periodo === "12m"
            ? subMonths(new Date(), 12)
            : null;

    return agendamentos.filter((agendamento) => {
      if (status !== "todos" && agendamento.status !== status) return false;
      if (limite && !isAfter(parseISO(agendamento.data), limite)) return false;
      return true;
    });
  }, [agendamentos, status, periodo]);

  const columns = React.useMemo<ColumnDef<Agendamento, unknown>[]>(
    () => [
      {
        id: "data",
        accessorFn: (row) => formatDate(row.data),
        header: "Data",
        cell: ({ row }) => (
          <div>
            <p className="font-medium tabular-nums text-foreground">{formatDate(row.original.data)}</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {row.original.horaInicio}–{row.original.horaFim}
            </p>
          </div>
        ),
      },
      {
        id: "tipo",
        accessorFn: (row) => (row.tipo === "avaliacao" ? "Avaliação" : "Atendimento"),
        header: "Tipo",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
      },
      { accessorKey: "procedimentoNome", header: "Procedimento" },
      { accessorKey: "profissionalNome", header: "Profissional" },
      {
        id: "origem",
        accessorFn: (row) => origemAgendamento(row),
        header: "Origem",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "valor",
        accessorFn: (row) => row.valor,
        header: "Valor",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.valor)}</span>,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="agendamento" status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={dados}
      searchPlaceholder="Buscar por procedimento ou profissional..."
      exportFileName="historico-paciente"
      pageSize={12}
      emptyTitle="Nenhum agendamento no período"
      emptyDescription="Ajuste o filtro de período ou de status para ver outros registros."
      toolbar={
        <>
          <Select value={periodo} onValueChange={(valor) => setPeriodo(valor as Periodo)}>
            <SelectTrigger className="w-40" aria-label="Filtrar por período">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo o período</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo status</SelectItem>
              <SelectItem value="atendido">Atendidos</SelectItem>
              <SelectItem value="agendado">Agendados</SelectItem>
              <SelectItem value="confirmado">Confirmados</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
              <SelectItem value="faltou">Faltas</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
