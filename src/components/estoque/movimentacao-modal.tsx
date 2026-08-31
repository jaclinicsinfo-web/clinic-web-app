"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-section";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { registrarMovimentacaoApi } from "@/services/estoque";
import type { MovimentacaoEstoque, Produto } from "@/types";

const movimentacaoSchema = z.object({
  produtoId: z.string().min(1, "Selecione o produto."),
  tipo: z.enum(["entrada", "saida"]),
  quantidade: z
    .string()
    .min(1, "Informe a quantidade.")
    .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero."),
  data: z.string().min(1, "Informe a data da movimentação."),
  motivo: z.string().min(3, "Descreva o motivo da movimentação."),
  procedimentoId: z.string().optional(),
});

type MovimentacaoFormValues = z.infer<typeof movimentacaoSchema>;

interface MovimentacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtos: Produto[];
  procedimentos?: { id: string; nome: string }[];
  dataPadrao: string;
  produtoSelecionadoId?: string;
  onRegistrada?: (resultado: { produto: Produto; movimentacao: MovimentacaoEstoque }) => void;
}

export function MovimentacaoModal({
  open,
  onOpenChange,
  produtos,
  procedimentos = [],
  dataPadrao,
  produtoSelecionadoId,
  onRegistrada,
}: MovimentacaoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MovimentacaoFormValues>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      produtoId: produtoSelecionadoId ?? "",
      tipo: "entrada",
      quantidade: "",
      data: dataPadrao,
      motivo: "",
      procedimentoId: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        produtoId: produtoSelecionadoId ?? "",
        tipo: "entrada",
        quantidade: "",
        data: dataPadrao,
        motivo: "",
        procedimentoId: "",
      });
    }
  }, [open, produtoSelecionadoId, dataPadrao, reset]);

  const produtoId = watch("produtoId");
  const tipo = watch("tipo");
  const quantidade = watch("quantidade");
  const produto = produtos.find((item) => item.id === produtoId);

  const saldoProjetado = produto
    ? produto.quantidadeAtual + (tipo === "entrada" ? 1 : -1) * (Number(quantidade) || 0)
    : null;

  async function onSubmit(values: MovimentacaoFormValues) {
    try {
      const resultado = await registrarMovimentacaoApi({
        produtoId: values.produtoId,
        tipo: values.tipo,
        quantidade: Number(values.quantidade),
        data: values.data,
        motivo: values.motivo,
        procedimentoId: values.procedimentoId || null,
      });
      const nome = resultado.produto.nome;
      toast.success(values.tipo === "entrada" ? "Entrada registrada" : "Saída registrada", {
        description: `${nome} · ${formatNumber(Number(values.quantidade))} ${resultado.produto.unidadeMedida}`,
      });
      onRegistrada?.(resultado);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível registrar a movimentação.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Registrar movimentação de estoque</DialogTitle>
          <DialogDescription>
            Lance entradas de compra ou saídas de consumo para manter o saldo dos insumos atualizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <DialogBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Produto" htmlFor="produtoId" error={errors.produtoId?.message} required full>
                <Select value={produtoId} onValueChange={(valor) => setValue("produtoId", valor)}>
                  <SelectTrigger id="produtoId" aria-invalid={Boolean(errors.produtoId)}>
                    <SelectValue placeholder="Selecione o insumo" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Tipo de movimentação" htmlFor="tipo" error={errors.tipo?.message} required>
                <Select value={tipo} onValueChange={(valor) => setValue("tipo", valor as "entrada" | "saida")}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Quantidade"
                htmlFor="quantidade"
                error={errors.quantidade?.message}
                hint={produto ? `Unidade de medida: ${produto.unidadeMedida}` : undefined}
                required
              >
                <Input
                  id="quantidade"
                  inputMode="numeric"
                  placeholder="0"
                  aria-invalid={Boolean(errors.quantidade)}
                  {...register("quantidade")}
                />
              </FormField>

              <FormField label="Data" htmlFor="data" error={errors.data?.message} required>
                <Input id="data" type="date" aria-invalid={Boolean(errors.data)} {...register("data")} />
              </FormField>

              {procedimentos.length > 0 && (
                <FormField label="Procedimento (opcional)" htmlFor="procedimentoId">
                  <Select
                    value={watch("procedimentoId") || "nenhum"}
                    onValueChange={(valor) => setValue("procedimentoId", valor === "nenhum" ? "" : valor)}
                  >
                    <SelectTrigger id="procedimentoId">
                      <SelectValue placeholder="Não vinculado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Não vinculado</SelectItem>
                      {procedimentos.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}

              <FormField label="Motivo" htmlFor="motivo" error={errors.motivo?.message} required full>
                <Textarea
                  id="motivo"
                  placeholder="Compra — NF 88214, consumo em procedimento, perda por validade..."
                  aria-invalid={Boolean(errors.motivo)}
                  {...register("motivo")}
                />
              </FormField>
            </div>

            {produto && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  Saldo atual: <span className="font-medium text-foreground">{formatNumber(produto.quantidadeAtual)}</span>{" "}
                  {produto.unidadeMedida} · mínimo {formatNumber(produto.estoqueMinimo)}
                </span>
                <span className="text-muted-foreground">
                  Saldo após o lançamento:{" "}
                  <span
                    className={
                      saldoProjetado !== null && saldoProjetado < produto.estoqueMinimo
                        ? "font-semibold text-danger"
                        : "font-semibold text-foreground"
                    }
                  >
                    {formatNumber(Math.max(saldoProjetado ?? 0, 0))}
                  </span>
                </span>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Registrar movimentação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
