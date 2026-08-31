"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-section";
import { MoneyInput } from "@/components/shared/money-input";
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
import { ApiError } from "@/lib/api";
import { atualizarProdutoApi, criarProdutoApi } from "@/services/estoque";
import type { Produto } from "@/types";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome do produto."),
  categoria: z.string().min(1, "Selecione a categoria."),
  unidadeMedida: z.string().min(1, "Selecione a unidade de medida."),
  quantidadeAtual: z.number().min(0, "A quantidade não pode ser negativa."),
  estoqueMinimo: z.number().min(0, "O estoque mínimo não pode ser negativo."),
  custoUnitario: z.number().min(0, "Informe o custo unitário."),
  fornecedor: z.string().min(2, "Informe o fornecedor."),
});

type FormValues = z.infer<typeof schema>;

interface ProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: string[];
  unidadesMedida: string[];
  produto?: Produto | null;
  onSalvo: (produto: Produto) => void;
}

export function ProdutoDialog({
  open,
  onOpenChange,
  categorias,
  unidadesMedida,
  produto,
  onSalvo,
}: ProdutoDialogProps) {
  const editando = Boolean(produto);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      categoria: "",
      unidadeMedida: "",
      quantidadeAtual: 0,
      estoqueMinimo: 0,
      custoUnitario: 0,
      fornecedor: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    reset(
      produto
        ? {
            nome: produto.nome,
            categoria: produto.categoria,
            unidadeMedida: produto.unidadeMedida,
            quantidadeAtual: produto.quantidadeAtual,
            estoqueMinimo: produto.estoqueMinimo,
            custoUnitario: produto.custoUnitario,
            fornecedor: produto.fornecedor,
          }
        : {
            nome: "",
            categoria: "",
            unidadeMedida: "",
            quantidadeAtual: 0,
            estoqueMinimo: 0,
            custoUnitario: 0,
            fornecedor: "",
          },
    );
  }, [open, produto, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const salvo = editando && produto
        ? await atualizarProdutoApi(produto.id, {
            nome: values.nome,
            categoria: values.categoria,
            unidadeMedida: values.unidadeMedida,
            estoqueMinimo: values.estoqueMinimo,
            custoUnitario: values.custoUnitario,
            fornecedor: values.fornecedor,
          })
        : await criarProdutoApi(values);
      onSalvo(salvo);
      toast.success(editando ? "Produto atualizado" : "Produto cadastrado", { description: values.nome });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o produto.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            Cadastre insumos com estoque mínimo para receber alerta quando o saldo ficar baixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <DialogBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Nome" htmlFor="prod-nome" error={errors.nome?.message} required full>
                <Input id="prod-nome" aria-invalid={Boolean(errors.nome)} {...register("nome")} />
              </FormField>
              <FormField label="Fornecedor" htmlFor="prod-fornecedor" error={errors.fornecedor?.message} required>
                <Input id="prod-fornecedor" aria-invalid={Boolean(errors.fornecedor)} {...register("fornecedor")} />
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
              <FormField label="Unidade de medida" error={errors.unidadeMedida?.message} required>
                <Select value={watch("unidadeMedida")} onValueChange={(valor) => setValue("unidadeMedida", valor)}>
                  <SelectTrigger aria-label="Unidade de medida">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              {!editando && (
                <FormField
                  label="Quantidade inicial"
                  htmlFor="prod-qtd"
                  error={errors.quantidadeAtual?.message}
                  required
                >
                  <Input
                    id="prod-qtd"
                    type="number"
                    min={0}
                    step="0.01"
                    aria-invalid={Boolean(errors.quantidadeAtual)}
                    {...register("quantidadeAtual", { valueAsNumber: true })}
                  />
                </FormField>
              )}
              <FormField label="Estoque mínimo" htmlFor="prod-min" error={errors.estoqueMinimo?.message} required>
                <Input
                  id="prod-min"
                  type="number"
                  min={0}
                  step="0.01"
                  aria-invalid={Boolean(errors.estoqueMinimo)}
                  {...register("estoqueMinimo", { valueAsNumber: true })}
                />
              </FormField>
              <FormField label="Custo unitário" error={errors.custoUnitario?.message} required>
                <MoneyInput
                  value={watch("custoUnitario")}
                  onChange={(valor) => setValue("custoUnitario", valor, { shouldValidate: true })}
                />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
