"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Archive, CalendarPlus, MoreHorizontal, Pencil, UserRound } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { calculateAge, formatCurrency, formatDate, formatIdade, formatPhone } from "@/lib/format";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import { temPermissao } from "@/lib/permissoes";
import type { Paciente } from "@/types";

interface PacientesTableProps {
  pacientes: Paciente[];
  profissionais: { id: string; nome: string }[];
  carregando?: boolean;
  somenteProprios?: boolean;
  onArquivar: (paciente: Paciente) => Promise<void>;
}

type FaixaEtaria = "todas" | "crianca" | "adulto" | "idoso";

function nomeConvenio(paciente: Paciente) {
  if (paciente.convenioNome) return paciente.convenioNome;
  return paciente.convenioId ? "Convênio" : "Particular";
}

export function PacientesTable({
  pacientes,
  profissionais,
  carregando,
  somenteProprios,
  onArquivar,
}: PacientesTableProps) {
  const router = useRouter();
  const sessao = useSessaoStore((state) => state.sessao);
  const permissoes = sessao?.permissoes;
  const podeEditar = temPermissao(permissoes, "pacientes", "editar");
  const podeDesativar = temPermissao(permissoes, "pacientes", "excluir");
  const podeAgendar = temPermissao(permissoes, "agenda", "criar");
  const mostraFinanceiro = planoIncluiModulo(sessao?.plano, "financeiro") && temPermissao(permissoes, "financeiro");
  const [status, setStatus] = React.useState("todos");
  const [profissional, setProfissional] = React.useState("todos");
  const [faixa, setFaixa] = React.useState<FaixaEtaria>("todas");
  const [arquivando, setArquivando] = React.useState<Paciente | null>(null);
  const [arquivandoEnvio, setArquivandoEnvio] = React.useState(false);

  const dados = React.useMemo(() => {
    return pacientes.filter((paciente) => {
      if (status !== "todos" && paciente.status !== status) return false;
      if (profissional !== "todos" && paciente.profissionalPreferidoId !== profissional) return false;

      if (faixa !== "todas") {
        const idade = calculateAge(paciente.dataNascimento);
        if (faixa === "crianca" && idade >= 18) return false;
        if (faixa === "adulto" && (idade < 18 || idade >= 60)) return false;
        if (faixa === "idoso" && idade < 60) return false;
      }

      return true;
    });
  }, [pacientes, status, profissional, faixa]);

  const columns = React.useMemo<ColumnDef<Paciente, unknown>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Paciente",
        cell: ({ row }) => {
          const paciente = row.original;
          return (
            <div className="min-w-0">
              <Link
                href={`/pacientes/${paciente.id}`}
                className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {paciente.nome}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatIdade(paciente.dataNascimento)}
                {paciente.alergias.length > 0 && (
                  <span className="ml-2 text-danger">· Alergia: {paciente.alergias.join(", ")}</span>
                )}
              </p>
            </div>
          );
        },
      },
      {
        id: "telefone",
        accessorFn: (row) => formatPhone(row.whatsapp ?? row.telefone),
        header: "Telefone",
        cell: ({ getValue }) => <span className="tabular-nums">{getValue() as string}</span>,
      },
      {
        id: "convenio",
        accessorFn: (row) => nomeConvenio(row),
        header: "Convênio",
        cell: ({ getValue }) => {
          const nome = getValue() as string;
          return <Badge tone={nome === "Particular" ? "outline" : "primary"}>{nome}</Badge>;
        },
      },
      {
        id: "ultimoAtendimento",
        accessorFn: (row) => (row.ultimoAtendimento ? formatDate(row.ultimoAtendimento) : "—"),
        header: "Último atendimento",
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
      },
      {
        id: "proximoAgendamento",
        accessorFn: (row) => (row.proximoAgendamento ? formatDate(row.proximoAgendamento) : "—"),
        header: "Próximo agendamento",
        cell: ({ getValue }) => {
          const valor = getValue() as string;
          return valor === "—" ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <span className="tabular-nums font-medium text-info">{valor}</span>
          );
        },
      },
      ...(mostraFinanceiro
        ? [
            {
              id: "saldoDevedor",
              accessorFn: (row: Paciente) => row.saldoDevedor,
              header: "Em aberto",
              cell: ({ row }: { row: { original: Paciente } }) => {
                const valor = row.original.saldoDevedor;
                return valor > 0 ? (
                  <span className="font-medium tabular-nums text-danger">{formatCurrency(valor)}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                );
              },
            } satisfies ColumnDef<Paciente, unknown>,
          ]
        : []),
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="paciente" status={row.original.status} />,
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false,
        size: 56,
        cell: ({ row }) => {
          const paciente = row.original;
          return (
            <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${paciente.nome}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => router.push(`/pacientes/${paciente.id}`)}>
                    <UserRound />
                    Ver perfil
                  </DropdownMenuItem>
                  {podeAgendar && (
                    <DropdownMenuItem onSelect={() => router.push(`/agenda?paciente=${paciente.id}`)}>
                      <CalendarPlus />
                      Agendar
                    </DropdownMenuItem>
                  )}
                  {podeEditar && (
                    <DropdownMenuItem onSelect={() => router.push(`/pacientes/${paciente.id}/editar`)}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {podeDesativar && paciente.status !== "arquivado" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onSelect={() => setArquivando(paciente)}>
                        <Archive />
                        Arquivar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [router, podeEditar, podeDesativar, podeAgendar, mostraFinanceiro],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por nome, CPF ou telefone..."
        onRowClick={(paciente) => router.push(`/pacientes/${paciente.id}`)}
        exportFileName="pacientes"
        pageSize={10}
        emptyTitle={carregando ? "Carregando pacientes..." : "Nenhum paciente encontrado"}
        emptyDescription={
          carregando
            ? "Buscando os registros da clínica."
            : somenteProprios
              ? "Somente pacientes com você como profissional preferido aparecem nesta lista."
              : "Ajuste os filtros ou cadastre um novo paciente."
        }
        toolbar={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-auto shrink-0" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
                <SelectItem value="arquivado">Arquivados</SelectItem>
              </SelectContent>
            </Select>

            {!somenteProprios && (
              <Select value={profissional} onValueChange={setProfissional}>
                <SelectTrigger className="w-auto max-w-[14rem] shrink-0" aria-label="Filtrar por profissional">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo profissional</SelectItem>
                  {profissionais.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={faixa} onValueChange={(valor) => setFaixa(valor as FaixaEtaria)}>
              <SelectTrigger className="w-auto shrink-0" aria-label="Filtrar por faixa etária">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda idade</SelectItem>
                <SelectItem value="crianca">Até 17 anos</SelectItem>
                <SelectItem value="adulto">18 a 59 anos</SelectItem>
                <SelectItem value="idoso">60+ anos</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(arquivando)}
        onOpenChange={(aberto) => !aberto && setArquivando(null)}
        title="Arquivar paciente?"
        description={`${arquivando?.nome ?? ""} deixará de aparecer nas listagens ativas, mas o histórico e o prontuário serão preservados.`}
        confirmLabel="Arquivar"
        loading={arquivandoEnvio}
        onConfirm={async () => {
          if (!arquivando) return;
          setArquivandoEnvio(true);
          try {
            await onArquivar(arquivando);
            toast.success("Paciente arquivado", { description: arquivando.nome });
            setArquivando(null);
          } catch (error) {
            toast.error(
              error instanceof ApiError ? error.message : "Não foi possível arquivar o paciente.",
            );
          } finally {
            setArquivandoEnvio(false);
          }
        }}
      />
    </>
  );
}
