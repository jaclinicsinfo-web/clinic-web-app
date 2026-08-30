"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPhone } from "@/lib/format";
import type { PacienteStatus } from "@/types";

export interface PacienteAtendido {
  id: string;
  nome: string;
  telefone: string;
  convenio: string;
  status: PacienteStatus;
  atendimentos: number;
  ultimaVisita?: string;
}

export function ProfissionalPacientesTable({ pacientes }: { pacientes: PacienteAtendido[] }) {
  const router = useRouter();

  const columns = React.useMemo<ColumnDef<PacienteAtendido, unknown>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Paciente",
        cell: ({ row }) => (
          <Link
            href={`/pacientes/${row.original.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {row.original.nome}
          </Link>
        ),
      },
      {
        id: "telefone",
        accessorFn: (row) => formatPhone(row.telefone),
        header: "Telefone",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "convenio",
        accessorFn: (row) => row.convenio,
        header: "Convênio",
        cell: ({ getValue }) => {
          const nome = getValue() as string;
          return <Badge tone={nome === "Particular" ? "outline" : "primary"}>{nome}</Badge>;
        },
      },
      {
        id: "atendimentos",
        accessorFn: (row) => row.atendimentos,
        header: "Atendimentos",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-foreground">{row.original.atendimentos}</span>
        ),
      },
      {
        id: "ultimaVisita",
        accessorFn: (row) => (row.ultimaVisita ? formatDate(row.ultimaVisita) : "—"),
        header: "Última visita",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="paciente" status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={pacientes}
      searchPlaceholder="Buscar paciente..."
      onRowClick={(paciente) => router.push(`/pacientes/${paciente.id}`)}
      exportFileName="pacientes-do-profissional"
      emptyTitle="Nenhum paciente vinculado"
      emptyDescription="Assim que houver agendamentos, os pacientes atendidos aparecem aqui."
    />
  );
}
