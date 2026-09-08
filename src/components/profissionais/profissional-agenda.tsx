"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { addDays, isAfter, isBefore, isSameMonth, parseISO, startOfDay, subMonths } from "date-fns";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, formatWeekday } from "@/lib/format";
import type { Agendamento } from "@/types";

type Periodo = "proximos" | "mes" | "anterior" | "todos";

interface ProfissionalAgendaProps {
  agendamentos: Agendamento[];
}

export function ProfissionalAgenda({ agendamentos }: ProfissionalAgendaProps) {
  const [periodo, setPeriodo] = React.useState<Periodo>("mes");
  const [status, setStatus] = React.useState("todos");

  const dados = React.useMemo(() => {
    const hoje = startOfDay(new Date());
    const limite = addDays(hoje, 7);
    const mesAnterior = subMonths(hoje, 1);

    return agendamentos.filter((agendamento) => {
      const data = parseISO(agendamento.data);

      if (periodo === "proximos" && (isBefore(data, hoje) || isAfter(data, limite))) return false;
      if (periodo === "mes" && !isSameMonth(data, hoje)) return false;
      if (periodo === "anterior" && !isSameMonth(data, mesAnterior)) return false;
      if (status !== "todos" && agendamento.status !== status) return false;

      return true;
    });
  }, [agendamentos, periodo, status]);

  const columns = React.useMemo<ColumnDef<Agendamento, unknown>[]>(
    () => [
      {
        id: "data",
        accessorFn: (row) => row.data,
        header: "Data",
        cell: ({ row }) => (
          <div>
            <p className="font-medium tabular-nums text-foreground">{formatDate(row.original.data)}</p>
            <p className="text-xs capitalize text-muted-foreground">{formatWeekday(row.original.data)}</p>
          </div>
        ),
      },
      {
        id: "horario",
        accessorFn: (row) => `${row.horaInicio} – ${row.horaFim}`,
        header: "Horário",
        cell: ({ getValue }) => <span className="tabular-nums text-foreground">{getValue() as string}</span>,
      },
      {
        id: "paciente",
        accessorFn: (row) => row.pacienteNome,
        header: "Paciente",
        cell: ({ row }) => (
          <Link
            href={`/pacientes/${row.original.pacienteId}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {row.original.pacienteNome}
          </Link>
        ),
      },
      {
        id: "tipo",
        accessorFn: (row) => (row.tipo === "avaliacao" ? "Avaliação" : "Atendimento"),
        header: "Tipo",
        cell: ({ row }) => (
          <Badge tone={row.original.tipo === "avaliacao" ? "info" : "outline"}>
            {row.original.tipo === "avaliacao" ? "Avaliação" : "Atendimento"}
          </Badge>
        ),
      },
      {
        id: "procedimento",
        accessorFn: (row) => row.procedimentoNome,
        header: "Procedimento",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "sala",
        accessorFn: (row) => row.sala ?? "—",
        header: "Sala",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "origem",
        accessorFn: (row) => (row.particular ? "Particular" : "Convênio"),
        header: "Origem",
        cell: ({ getValue }) => {
          const origem = getValue() as string;
          return <Badge tone={origem === "Particular" ? "outline" : "primary"}>{origem}</Badge>;
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
      searchPlaceholder="Buscar por paciente ou procedimento..."
      exportFileName="agenda-do-profissional"
      pageSize={12}
      emptyTitle="Nenhum atendimento no período"
      emptyDescription="Ajuste o período ou o status para ver outros agendamentos."
      toolbar={
        <>
          <Select value={periodo} onValueChange={(valor) => setPeriodo(valor as Periodo)}>
            <SelectTrigger className="w-44" aria-label="Filtrar por período">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proximos">Próximos 7 dias</SelectItem>
              <SelectItem value="mes">Mês corrente</SelectItem>
              <SelectItem value="anterior">Mês anterior</SelectItem>
              <SelectItem value="todos">Todo o histórico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo status</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="check_in">Check-in</SelectItem>
              <SelectItem value="em_atendimento">Em atendimento</SelectItem>
              <SelectItem value="atendido">Atendido</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="faltou">Faltou</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    />
  );
}
