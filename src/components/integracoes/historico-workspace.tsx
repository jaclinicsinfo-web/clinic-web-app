"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { canalLabels, tipoLembreteLabels } from "@/components/integracoes/labels";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime, formatISODate } from "@/lib/format";
import {
  listarEnviosLembreteApi,
  type CanalLembrete,
  type EnvioLembrete,
  type FiltroIntegracoes,
  type StatusEnvio,
  type TipoLembrete,
} from "@/services/integracoes";

function inicioMes() {
  const hoje = new Date();
  return formatISODate(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
}

export function HistoricoEnviosWorkspace() {
  const [envios, setEnvios] = React.useState<EnvioLembrete[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [filtro, setFiltro] = React.useState<FiltroIntegracoes>({
    de: inicioMes(),
    ate: formatISODate(new Date()),
  });
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    setErro(null);
    listarEnviosLembreteApi(filtro)
      .then((lista) => {
        if (ativo) setEnvios(lista);
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o histórico.");
      });
    return () => {
      ativo = false;
    };
  }, [filtro.de, filtro.ate, filtro.canal, filtro.status, filtro.tipo, filtro.busca, tentativa]);

  const colunas = React.useMemo<ColumnDef<EnvioLembrete>[]>(
    () => [
      {
        accessorKey: "criadoEm",
        header: "Data",
        cell: ({ row }) => (row.original.criadoEm ? formatDateTime(row.original.criadoEm) : "—"),
      },
      {
        id: "agendamento",
        header: "Agendamento",
        cell: ({ row }) =>
          `${row.original.agendamentoData ? formatDate(row.original.agendamentoData) : "—"} ${row.original.agendamentoHora}`,
      },
      { accessorKey: "pacienteNome", header: "Paciente" },
      { accessorKey: "profissionalNome", header: "Profissional" },
      {
        accessorKey: "canal",
        header: "Canal",
        cell: ({ row }) => canalLabels[row.original.canal],
      },
      {
        accessorKey: "destinatarioTipo",
        header: "Destinatário",
        cell: ({ row }) => (row.original.destinatarioTipo === "paciente" ? "Paciente" : "Profissional"),
      },
      {
        accessorKey: "tipoLembrete",
        header: "Tipo",
        cell: ({ row }) => tipoLembreteLabels[row.original.tipoLembrete],
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="envio" status={row.original.status} />,
      },
      {
        accessorKey: "custo",
        header: "Custo",
        cell: ({ row }) => formatCurrency(row.original.custo),
      },
      {
        accessorKey: "erro",
        header: "Erro",
        cell: ({ row }) => row.original.erro ?? "—",
      },
    ],
    [],
  );

  if (erro) {
    return (
      <EmptyState
        title="Não foi possível carregar"
        description={erro}
        action={
          <Button variant="outline" onClick={() => setTentativa((atual) => atual + 1)}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  if (!envios) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de envios"
        description="Auditoria de cada tentativa: agendamento, destinatário, canal, status, custo e erro."
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">De</span>
          <Input type="date" value={filtro.de ?? ""} onChange={(event) => setFiltro((atual) => ({ ...atual, de: event.target.value }))} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Até</span>
          <Input type="date" value={filtro.ate ?? ""} onChange={(event) => setFiltro((atual) => ({ ...atual, ate: event.target.value }))} />
        </label>
        <Select
          value={filtro.canal || "todos"}
          onValueChange={(valor) => setFiltro((atual) => ({ ...atual, canal: valor === "todos" ? "" : (valor as CanalLembrete) }))}
        >
          <SelectTrigger className="w-40"><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os canais</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtro.status || "todos"}
          onValueChange={(valor) => setFiltro((atual) => ({ ...atual, status: valor === "todos" ? "" : (valor as StatusEnvio) }))}
        >
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="lido">Lido</SelectItem>
            <SelectItem value="falhou">Falhou</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtro.tipo || "todos"}
          onValueChange={(valor) => setFiltro((atual) => ({ ...atual, tipo: valor === "todos" ? "" : (valor as TipoLembrete) }))}
        >
          <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="antecedencia">Antecedência</SelectItem>
            <SelectItem value="confirmacao">Confirmação</SelectItem>
            <SelectItem value="reagendamento">Reagendamento</SelectItem>
            <SelectItem value="cancelamento">Cancelamento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={colunas}
        data={envios}
        searchPlaceholder="Buscar paciente, profissional ou destinatário..."
        emptyTitle="Nenhum envio encontrado"
        emptyDescription="Ajuste os filtros ou aguarde a agenda gerar lembretes."
        exportFileName="historico-envios"
      />
    </div>
  );
}
