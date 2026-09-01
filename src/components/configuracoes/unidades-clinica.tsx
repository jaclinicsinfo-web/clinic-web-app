"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoreHorizontal, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { limiteUnidadesDoPlano } from "@/lib/modulos-plano";
import { useSessaoStore } from "@/hooks/use-sessao";
import {
  ativarUnidadeApi,
  atualizarUnidadeApi,
  criarUnidadeApi,
  inativarUnidadeApi,
  type UnidadeMutacao,
} from "@/services/configuracoes";
import type { Unidade } from "@/types";

const schema = z.object({
  nome: z.string().trim().min(3, "Nome da unidade deve ter no mínimo 3 caracteres."),
  cidade: z.string().trim().min(2, "Informe a cidade."),
});

type FormValues = z.infer<typeof schema>;

export function UnidadesClinica({
  unidades,
  podeCriar,
  podeEditar,
  onMutacao,
}: {
  unidades: Unidade[];
  podeCriar: boolean;
  podeEditar: boolean;
  onMutacao: (resultado: UnidadeMutacao, unidades: Unidade[]) => void | Promise<void>;
}) {
  const plano = useSessaoStore((state) => state.sessao?.plano);
  const [aberto, setAberto] = React.useState(false);
  const [editando, setEditando] = React.useState<Unidade | null>(null);
  const [inativando, setInativando] = React.useState<Unidade | null>(null);
  const [ativando, setAtivando] = React.useState<Unidade | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", cidade: "" },
  });

  function abrirNova() {
    setEditando(null);
    reset({ nome: "", cidade: "" });
    setAberto(true);
  }

  function abrirEdicao(unidade: Unidade) {
    setEditando(unidade);
    reset({ nome: unidade.nome, cidade: unidade.cidade });
    setAberto(true);
  }

  function aplicarLista(resultado: UnidadeMutacao) {
    const demais = unidades.filter((item) => item.id !== resultado.unidade.id);
    const lista = [...demais, resultado.unidade].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return lista;
  }

  async function onSubmit(values: FormValues) {
    try {
      const resultado = editando
        ? await atualizarUnidadeApi(editando.id, values)
        : await criarUnidadeApi(values);
      await onMutacao(resultado, aplicarLista(resultado));
      toast.success(editando ? "Unidade atualizada" : "Unidade cadastrada");
      setAberto(false);
      reset({ nome: "", cidade: "" });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar a unidade.");
    }
  }

  const ativas = unidades.filter((item) => item.ativo !== false).length;
  const limiteUnidades = limiteUnidadesDoPlano(plano);
  const noLimiteUnidades = limiteUnidades != null && ativas >= limiteUnidades;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Unidades</CardTitle>
            <CardDescription>
              {limiteUnidades == null
                ? "Filiais disponíveis no seletor da topbar (multi-unidade)."
                : `O plano ${plano?.nome ?? "Essencial"} inclui ${limiteUnidades} unidade. Faça upgrade para cadastrar filiais.`}
            </CardDescription>
          </div>
          {podeCriar && (
            <Button onClick={abrirNova} disabled={noLimiteUnidades} title={noLimiteUnidades ? "Limite do plano atingido." : undefined}>
              <Plus />
              Nova unidade
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {unidades.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">Nenhuma unidade cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  {podeEditar && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidades.map((unidade) => {
                  const ativa = unidade.ativo !== false;
                  return (
                    <TableRow key={unidade.id}>
                      <TableCell className="font-medium">{unidade.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{unidade.cidade}</TableCell>
                      <TableCell>
                        <StatusBadge domain="generico" status={ativa ? "ativo" : "inativo"} />
                      </TableCell>
                      {podeEditar && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${unidade.nome}`}>
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => abrirEdicao(unidade)}>
                                <Pencil />
                                Editar
                              </DropdownMenuItem>
                              {ativa ? (
                                <DropdownMenuItem
                                  destructive
                                  disabled={ativas <= 1}
                                  onSelect={() => setInativando(unidade)}
                                >
                                  <Power />
                                  Inativar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() => setAtivando(unidade)}
                                  disabled={noLimiteUnidades}
                                >
                                  <Power />
                                  Reativar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={aberto}
        onOpenChange={(estado) => {
          setAberto(estado);
          if (!estado) {
            setEditando(null);
            reset({ nome: "", cidade: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar unidade" : "Nova unidade"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "O nome aparece no seletor de contexto da topbar."
                : "Administradores passam a ter acesso automaticamente."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome" htmlFor="unidade-nome" error={errors.nome?.message} required>
                <Input
                  id="unidade-nome"
                  placeholder="Unidade Centro"
                  aria-invalid={Boolean(errors.nome)}
                  {...register("nome")}
                />
              </FormField>
              <FormField label="Cidade" htmlFor="unidade-cidade" error={errors.cidade?.message} required>
                <Input
                  id="unidade-cidade"
                  placeholder="Ribeirão Preto"
                  aria-invalid={Boolean(errors.cidade)}
                  {...register("cidade")}
                />
              </FormField>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {editando ? "Salvar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(inativando)}
        onOpenChange={(estado) => {
          if (!estado) setInativando(null);
        }}
        title="Inativar unidade"
        description={
          inativando
            ? `${inativando.nome} sai do seletor da topbar. Agendamentos e cadastros já feitos nesta unidade são mantidos.`
            : ""
        }
        confirmLabel="Inativar"
        onConfirm={async () => {
          if (!inativando) return;
          try {
            const resultado = await inativarUnidadeApi(inativando.id);
            await onMutacao(resultado, aplicarLista(resultado));
            toast.success("Unidade inativada");
            setInativando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível inativar a unidade.");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(ativando)}
        onOpenChange={(estado) => {
          if (!estado) setAtivando(null);
        }}
        title="Reativar unidade"
        description={ativando ? `${ativando.nome} volta a aparecer para quem já tem acesso.` : ""}
        confirmLabel="Reativar"
        destructive={false}
        onConfirm={async () => {
          if (!ativando) return;
          try {
            const resultado = await ativarUnidadeApi(ativando.id);
            await onMutacao(resultado, aplicarLista(resultado));
            toast.success("Unidade reativada");
            setAtivando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível reativar a unidade.");
          }
        }}
      />
    </>
  );
}
