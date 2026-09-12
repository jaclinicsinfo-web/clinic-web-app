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
import { ApiError } from "@/lib/api";
import { atualizarPontoApi, criarPontoApi } from "@/services/rh";
import type { RegistroPonto, UsuarioRh } from "@/types";

const schema = z.object({
  usuarioId: z.string().min(1, "Selecione o usuário."),
  data: z.string().min(1, "Informe a data."),
  entrada: z.string().optional(),
  saidaIntervalo: z.string().optional(),
  retornoIntervalo: z.string().optional(),
  saida: z.string().optional(),
  observacao: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function vazio(valor?: string) {
  const texto = valor?.trim();
  return texto ? texto : null;
}

interface PontoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarios: UsuarioRh[];
  dataPadrao: string;
  registro?: RegistroPonto | null;
  usuarioPadraoId?: string;
  onSalvo: (registro: RegistroPonto) => void;
}

export function PontoDialog({
  open,
  onOpenChange,
  usuarios,
  dataPadrao,
  registro,
  usuarioPadraoId,
  onSalvo,
}: PontoDialogProps) {
  const editando = Boolean(registro);
  const opcoes = usuarios.filter((item) => item.status === "ativo" || item.id === registro?.usuarioId);

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
      usuarioId: "",
      data: dataPadrao,
      entrada: "",
      saidaIntervalo: "",
      retornoIntervalo: "",
      saida: "",
      observacao: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    reset(
      registro
        ? {
            usuarioId: registro.usuarioId,
            data: registro.data,
            entrada: registro.entrada ?? "",
            saidaIntervalo: registro.saidaIntervalo ?? "",
            retornoIntervalo: registro.retornoIntervalo ?? "",
            saida: registro.saida ?? "",
            observacao: registro.observacao ?? "",
          }
        : {
            usuarioId: usuarioPadraoId ?? "",
            data: dataPadrao,
            entrada: "",
            saidaIntervalo: "",
            retornoIntervalo: "",
            saida: "",
            observacao: "",
          },
    );
  }, [open, registro, dataPadrao, usuarioPadraoId, reset]);

  async function onSubmit(values: FormValues) {
    const horarios = {
      entrada: vazio(values.entrada),
      saidaIntervalo: vazio(values.saidaIntervalo),
      retornoIntervalo: vazio(values.retornoIntervalo),
      saida: vazio(values.saida),
      observacao: vazio(values.observacao),
    };

    try {
      const salvo =
        editando && registro
          ? await atualizarPontoApi(registro.id, horarios)
          : await criarPontoApi({ usuarioId: values.usuarioId, data: values.data, ...horarios });
      onSalvo(salvo);
      toast.success(editando ? "Ponto atualizado" : "Ponto lançado", { description: salvo.usuarioNome });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o ponto.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar ponto" : "Lançar ponto"}</DialogTitle>
          <DialogDescription>
            Informe os horários do dia. O intervalo é opcional para quem não sai para almoço.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <DialogBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Usuário" error={errors.usuarioId?.message} required>
                <Select
                  value={watch("usuarioId")}
                  onValueChange={(valor) => setValue("usuarioId", valor, { shouldValidate: true })}
                  disabled={editando}
                >
                  <SelectTrigger aria-label="Usuário">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcoes.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Data" htmlFor="ponto-data" error={errors.data?.message} required>
                <Input id="ponto-data" type="date" disabled={editando} {...register("data")} />
              </FormField>
              <FormField label="Entrada" htmlFor="ponto-entrada">
                <Input id="ponto-entrada" type="time" {...register("entrada")} />
              </FormField>
              <FormField label="Início do intervalo" htmlFor="ponto-intervalo">
                <Input id="ponto-intervalo" type="time" {...register("saidaIntervalo")} />
              </FormField>
              <FormField label="Retorno do intervalo" htmlFor="ponto-retorno">
                <Input id="ponto-retorno" type="time" {...register("retornoIntervalo")} />
              </FormField>
              <FormField label="Saída" htmlFor="ponto-saida">
                <Input id="ponto-saida" type="time" {...register("saida")} />
              </FormField>
              <FormField label="Observação" htmlFor="ponto-obs" full>
                <Textarea id="ponto-obs" rows={3} {...register("observacao")} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editando ? "Salvar" : "Lançar ponto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
