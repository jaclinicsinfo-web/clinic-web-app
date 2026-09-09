"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal, Pencil, Power, ShieldCheck, Table2 } from "lucide-react";
import { toast } from "sonner";

import { ConvenioDialog } from "@/components/convenios/convenio-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import { formatPhone } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import type { Convenio } from "@/types";

interface ConveniosTableProps {
  convenios: Convenio[];
  onInativar?: (convenio: Convenio) => Promise<void> | void;
  onAtivar?: (convenio: Convenio) => Promise<void> | void;
  onAtualizado?: (convenio: Convenio) => void;
}

export function ConveniosTable({ convenios, onInativar, onAtivar, onAtualizado }: ConveniosTableProps) {
  const router = useRouter();
  const plano = useSessaoStore((state) => state.sessao?.plano);
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const mostraFaturamento = planoIncluiModulo(plano, "financeiro") && temPermissao(permissoes, "financeiro");
  const podeEditar = temPermissao(permissoes, "convenios", "editar");
  const podeDesativar = temPermissao(permissoes, "convenios", "excluir");
  const [status, setStatus] = React.useState("todos");
  const [autorizacao, setAutorizacao] = React.useState("todas");
  const [editando, setEditando] = React.useState<Convenio | null>(null);
  const [inativando, setInativando] = React.useState<Convenio | null>(null);
  const [ativando, setAtivando] = React.useState<Convenio | null>(null);

  const dados = React.useMemo(() => {
    return convenios.filter((convenio) => {
      if (status !== "todos" && convenio.status !== status) return false;
      if (autorizacao === "exige" && !convenio.exigeAutorizacaoPrevia) return false;
      if (autorizacao === "dispensa" && convenio.exigeAutorizacaoPrevia) return false;
      return true;
    });
  }, [convenios, status, autorizacao]);

  const columns = React.useMemo<ColumnDef<Convenio, unknown>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Convênio",
        cell: ({ row }) => {
          const convenio = row.original;
          return (
            <div className="min-w-0">
              <Link
                href={`/convenios/${convenio.id}`}
                className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {convenio.nome}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {convenio.contatoNome} · {formatPhone(convenio.contatoTelefone)}
              </p>
            </div>
          );
        },
      },
      {
        id: "registroAns",
        accessorFn: (row) => row.registroAns ?? "—",
        header: "Registro ANS",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "prazoPagamentoDias",
        accessorFn: (row) => row.prazoPagamentoDias,
        header: "Prazo de pagamento",
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground">{row.original.prazoPagamentoDias} dias</span>
        ),
      },
      {
        id: "autorizacao",
        accessorFn: (row) => (row.exigeAutorizacaoPrevia ? "Exige autorização" : "Sem autorização"),
        header: "Autorização prévia",
        cell: ({ row }) =>
          row.original.exigeAutorizacaoPrevia ? (
            <Badge tone="warning">Exige senha</Badge>
          ) : (
            <Badge tone="outline">Dispensa</Badge>
          ),
      },
      {
        id: "procedimentos",
        accessorFn: (row) => row.tabelaPrecos.length,
        header: "Procedimentos",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.tabelaPrecos.length} na tabela
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="generico" status={row.original.status} />,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false,
        size: 56,
        cell: ({ row }) => {
          const convenio = row.original;
          return (
            <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${convenio.nome}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => router.push(`/convenios/${convenio.id}`)}>
                    <ShieldCheck />
                    Ver convênio
                  </DropdownMenuItem>
                  {mostraFaturamento && (
                    <DropdownMenuItem onSelect={() => router.push(`/financeiro/convenios?convenio=${convenio.id}`)}>
                      <Table2 />
                      Faturamento
                    </DropdownMenuItem>
                  )}
                  {podeEditar && (
                    <DropdownMenuItem onSelect={() => setEditando(convenio)}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {convenio.portalUrl && (
                    <DropdownMenuItem asChild>
                      <a href={convenio.portalUrl} target="_blank" rel="noreferrer">
                        <ExternalLink />
                        Abrir portal
                      </a>
                    </DropdownMenuItem>
                  )}
                  {podeDesativar && (
                    <>
                      <DropdownMenuSeparator />
                      {convenio.status === "ativo" ? (
                        <DropdownMenuItem destructive onSelect={() => setInativando(convenio)}>
                          <Power />
                          Inativar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onSelect={() => setAtivando(convenio)}>
                          <Power />
                          Reativar
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [router, mostraFaturamento, podeEditar, podeDesativar],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por nome ou registro ANS..."
        onRowClick={(convenio) => router.push(`/convenios/${convenio.id}`)}
        exportFileName="convenios"
        emptyTitle="Nenhum convênio encontrado"
        emptyDescription="Ajuste os filtros ou cadastre um novo convênio."
        toolbar={
          <>
            <Select value={autorizacao} onValueChange={setAutorizacao}>
              <SelectTrigger className="w-48" aria-label="Filtrar por autorização prévia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda autorização</SelectItem>
                <SelectItem value="exige">Exige autorização</SelectItem>
                <SelectItem value="dispensa">Dispensa autorização</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConvenioDialog
        open={Boolean(editando)}
        onOpenChange={(aberto) => !aberto && setEditando(null)}
        convenio={editando}
        onSalvo={(atualizado) => {
          onAtualizado?.(atualizado);
          setEditando(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(inativando)}
        onOpenChange={(aberto) => !aberto && setInativando(null)}
        title="Inativar convênio?"
        description={`${inativando?.nome ?? ""} deixará de aparecer na criação de agendamentos e no vínculo de pacientes. Os lotes já enviados continuam no faturamento.`}
        confirmLabel="Inativar"
        onConfirm={async () => {
          if (!inativando) return;
          try {
            if (onInativar) await onInativar(inativando);
            toast.success("Convênio inativado", { description: inativando.nome });
            setInativando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível inativar o convênio.");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(ativando)}
        onOpenChange={(aberto) => !aberto && setAtivando(null)}
        title="Reativar convênio?"
        description={`${ativando?.nome ?? ""} voltará a aparecer na criação de agendamentos e no vínculo de pacientes.`}
        confirmLabel="Reativar"
        destructive={false}
        onConfirm={async () => {
          if (!ativando) return;
          try {
            if (onAtivar) await onAtivar(ativando);
            toast.success("Convênio reativado", { description: ativando.nome });
            setAtivando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível reativar o convênio.");
          }
        }}
      />
    </>
  );
}
