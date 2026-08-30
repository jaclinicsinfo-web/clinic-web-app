"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, UserX } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { FormField } from "@/components/shared/form-section";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import type { PerfilAcesso, Unidade, Usuario } from "@/types";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
  perfilId: z.string().min(1, "Selecione o perfil."),
  unidadeId: z.string().min(1, "Selecione ao menos uma unidade."),
});

type FormValues = z.infer<typeof schema>;

export function UsuariosTable({
  usuarios,
  perfis,
  unidades,
}: {
  usuarios: Usuario[];
  perfis: PerfilAcesso[];
  unidades: Unidade[];
}) {
  const [status, setStatus] = React.useState("todos");
  const [aberto, setAberto] = React.useState(false);
  const [inativando, setInativando] = React.useState<Usuario | null>(null);

  const dados = React.useMemo(
    () => usuarios.filter((usuario) => status === "todos" || usuario.status === status),
    [usuarios, status],
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
    defaultValues: { nome: "", email: "", perfilId: "", unidadeId: "" },
  });

  const columns = React.useMemo<ColumnDef<Usuario, unknown>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Usuário",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.nome}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "perfilNome",
        header: "Perfil",
      },
      {
        id: "unidades",
        accessorFn: (row) =>
          row.unidadesAcesso
            .map((id) => unidades.find((unidade) => unidade.id === id)?.nome ?? id)
            .join(", "),
        header: "Unidades",
      },
      {
        id: "ultimoAcesso",
        accessorFn: (row) => row.ultimoAcesso ?? "",
        header: "Último acesso",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.ultimoAcesso ? formatDateTime(row.original.ultimoAcesso) : "Nunca"}
          </span>
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
                <DropdownMenuItem destructive onSelect={() => setInativando(row.original)}>
                  <UserX />
                  Inativar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [unidades],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por nome ou e-mail..."
        exportFileName="usuarios"
        emptyTitle="Nenhum usuário encontrado"
        toolbar={
          <>
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
            <Button onClick={() => setAberto(true)}>
              <Plus />
              Novo usuário
            </Button>
          </>
        }
      />

      <Dialog
        open={aberto}
        onOpenChange={(estado) => {
          setAberto(estado);
          if (!estado) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>O convite de acesso é enviado por e-mail após salvar.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (values) => {
              await new Promise((resolve) => setTimeout(resolve, 500));
              toast.success("Usuário convidado", { description: values.email });
              reset();
              setAberto(false);
            })}
          >
            <DialogBody className="space-y-4">
              <FormField label="Nome" htmlFor="usuario-nome" error={errors.nome?.message} required>
                <Input id="usuario-nome" aria-invalid={Boolean(errors.nome)} {...register("nome")} />
              </FormField>
              <FormField label="E-mail" htmlFor="usuario-email" error={errors.email?.message} required>
                <Input id="usuario-email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
              </FormField>
              <FormField label="Perfil" error={errors.perfilId?.message} required>
                <Select value={watch("perfilId")} onValueChange={(valor) => setValue("perfilId", valor)}>
                  <SelectTrigger aria-label="Perfil">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map((perfil) => (
                      <SelectItem key={perfil.id} value={perfil.id}>
                        {perfil.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Unidade principal" error={errors.unidadeId?.message} required>
                <Select value={watch("unidadeId")} onValueChange={(valor) => setValue("unidadeId", valor)}>
                  <SelectTrigger aria-label="Unidade">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Enviar convite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(inativando)}
        onOpenChange={(abertoDialog) => !abertoDialog && setInativando(null)}
        title="Inativar usuário?"
        description={`${inativando?.nome ?? ""} perderá o acesso ao painel imediatamente.`}
        confirmLabel="Inativar"
        onConfirm={() => {
          toast.success("Usuário inativado", { description: inativando?.nome });
          setInativando(null);
        }}
      />
    </>
  );
}
