"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { FormField } from "@/components/shared/form-section";
import { MoneyInput } from "@/components/shared/money-input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatMinutes } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { Procedimento } from "@/types";
import { atualizarProcedimentoApi, criarProcedimentoApi, inativarProcedimentoApi } from "@/services/procedimentos";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome do procedimento."),
  categoria: z.string().min(1, "Selecione a categoria."),
  duracaoPadraoMin: z.number().min(10, "Duração mínima de 10 minutos.").max(240),
  valorParticular: z.number().min(1, "Informe o valor particular."),
});

type FormValues = z.infer<typeof schema>;

const VALORES_VAZIOS: FormValues = { nome: "", categoria: "", duracaoPadraoMin: 30, valorParticular: 0 };

export function ProcedimentosTable({
  procedimentos,
  categorias,
}: {
  procedimentos: Procedimento[];
  categorias: readonly string[];
}) {
  const [lista, setLista] = React.useState(procedimentos);
  const [status, setStatus] = React.useState("todos");
  const [categoria, setCategoria] = React.useState("todas");
  const [aberto, setAberto] = React.useState(false);
  const [editando, setEditando] = React.useState<Procedimento | null>(null);
  const [inativando, setInativando] = React.useState<Procedimento | null>(null);

  React.useEffect(() => {
    setLista(procedimentos);
  }, [procedimentos]);

  const dados = React.useMemo(
    () =>
      lista.filter((procedimento) => {
        if (status !== "todos" && procedimento.status !== status) return false;
        if (categoria !== "todas" && procedimento.categoria !== categoria) return false;
        return true;
      }),
    [lista, procedimentos, status, categoria],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: VALORES_VAZIOS,
  });

  function abrirNovo() {
    setEditando(null);
    reset(VALORES_VAZIOS);
    setAberto(true);
  }

  const abrirEdicao = React.useCallback(
    (procedimento: Procedimento) => {
      setEditando(procedimento);
      reset({
        nome: procedimento.nome,
        categoria: procedimento.categoria,
        duracaoPadraoMin: procedimento.duracaoPadraoMin,
        valorParticular: procedimento.valorParticular,
      });
      setAberto(true);
    },
    [reset],
  );

  const columns = React.useMemo<ColumnDef<Procedimento, unknown>[]>(
    () => [
      { accessorKey: "nome", header: "Procedimento" },
      { accessorKey: "categoria", header: "Categoria" },
      {
        id: "duracao",
        accessorFn: (row) => row.duracaoPadraoMin,
        header: "Duração",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{formatMinutes(row.original.duracaoPadraoMin)}</span>
        ),
      },
      {
        id: "valor",
        accessorFn: (row) => row.valorParticular,
        header: "Particular",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatCurrency(row.original.valorParticular)}</span>
        ),
      },
      {
        id: "convenios",
        accessorFn: (row) => row.valoresPorConvenio.length,
        header: "Convênios",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{row.original.valoresPorConvenio.length}</span>
        ),
      },
      {
        accessorKey: "status",
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
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${row.original.nome}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => abrirEdicao(row.original)}>
                  <Pencil />
                  Editar
                </DropdownMenuItem>
                {row.original.status === "ativo" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onSelect={() => setInativando(row.original)}>
                      <Power />
                      Inativar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [abrirEdicao],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar procedimento..."
        exportFileName="procedimentos"
        emptyTitle="Nenhum procedimento encontrado"
        toolbar={
          <>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-48" aria-label="Filtrar por categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
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
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={abrirNovo}>
              <Plus />
              Novo procedimento
            </Button>
          </>
        }
      />

      <Dialog
        open={aberto}
        onOpenChange={(estado) => {
          setAberto(estado);
          if (!estado) {
            setEditando(null);
            reset(VALORES_VAZIOS);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar procedimento" : "Novo procedimento"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Alterações de duração passam a valer nos próximos agendamentos."
                : "Duração padrão alimenta a agenda; valores de convênio saem na ficha da operadora."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (values) => {
              try {
                if (editando) {
                  const atualizado = await atualizarProcedimentoApi(editando.id, {
                    ...values,
                    status: editando.status,
                  });
                  setLista((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
                  toast.success("Procedimento atualizado", { description: values.nome });
                } else {
                  const criado = await criarProcedimentoApi(values);
                  setLista((atual) => [...atual, criado]);
                  toast.success("Procedimento cadastrado", { description: values.nome });
                }
                reset(VALORES_VAZIOS);
                setEditando(null);
                setAberto(false);
              } catch (error) {
                toast.error(
                  error instanceof ApiError
                    ? error.message
                    : editando
                      ? "Não foi possível atualizar o procedimento."
                      : "Não foi possível cadastrar o procedimento.",
                );
              }
            })}
          >
            <DialogBody className="space-y-4">
              <FormField label="Nome" htmlFor="proc-nome" error={errors.nome?.message} required>
                <Input id="proc-nome" aria-invalid={Boolean(errors.nome)} {...register("nome")} />
              </FormField>
              <FormField label="Categoria" error={errors.categoria?.message} required>
                <Select value={watch("categoria")} onValueChange={(valor) => setValue("categoria", valor)}>
                  <SelectTrigger aria-label="Categoria">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Duração padrão (min)" htmlFor="proc-duracao" error={errors.duracaoPadraoMin?.message} required>
                <Input
                  id="proc-duracao"
                  type="number"
                  min={10}
                  max={240}
                  aria-invalid={Boolean(errors.duracaoPadraoMin)}
                  {...register("duracaoPadraoMin", { valueAsNumber: true })}
                />
              </FormField>
              <FormField label="Valor particular" error={errors.valorParticular?.message} required>
                <MoneyInput
                  value={watch("valorParticular")}
                  onChange={(valor) => setValue("valorParticular", valor, { shouldValidate: true })}
                />
              </FormField>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(inativando)}
        onOpenChange={(abertoDialog) => !abertoDialog && setInativando(null)}
        title="Inativar procedimento?"
        description={`${inativando?.nome ?? ""} deixará de aparecer na criação de agendamentos.`}
        confirmLabel="Inativar"
        onConfirm={async () => {
          if (!inativando) return;
          try {
            const atualizado = await inativarProcedimentoApi(inativando.id);
            setLista((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
            toast.success("Procedimento inativado", { description: inativando.nome });
            setInativando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível inativar o procedimento.");
          }
        }}
      />
    </>
  );
}
