"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormField, FormSection } from "@/components/shared/form-section";
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
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import {
  atualizarRegraLembreteApi,
  criarRegraLembreteApi,
  type CanalLembrete,
  type RegraLembrete,
  type TemplateMensagem,
} from "@/services/integracoes";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome da regra."),
  tipo: z.enum(["antecedencia", "confirmacao", "reagendamento", "cancelamento"]),
  antecedenciaMinutos: z.number().nullable(),
  destinatarios: z.enum(["paciente", "profissional", "ambos"]),
  whatsapp: z.literal(true),
  templateWhatsappId: z.string().nullable(),
  ativo: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function RegraDialog({
  regra,
  templates,
  onOpenChange,
  onSalvo,
  onExcluir,
}: {
  regra: RegraLembrete | null;
  templates: TemplateMensagem[];
  onOpenChange: (aberto: boolean) => void;
  onSalvo: () => void | Promise<void>;
  onExcluir?: () => void;
}) {
  const sessao = useSessaoStore((state) => state.sessao);
  const podeEditar = temPermissao(sessao?.permissoes, "integracoes", regra ? "editar" : "criar");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: regra
      ? {
          nome: regra.nome,
          tipo: regra.tipo,
          antecedenciaMinutos: regra.antecedenciaMinutos,
          destinatarios: regra.destinatarios,
          whatsapp: true,
          templateWhatsappId: regra.templateWhatsappId,
          ativo: regra.ativo,
        }
      : {
          nome: "",
          tipo: "antecedencia",
          antecedenciaMinutos: 1440,
          destinatarios: "paciente",
          whatsapp: true,
          templateWhatsappId: templates.find((item) => item.canal === "whatsapp")?.id ?? null,
          ativo: true,
        },
  });

  const tipo = form.watch("tipo");

  async function onSubmit(values: FormValues) {
    if (!values.templateWhatsappId) {
      toast.error("Selecione o template de WhatsApp.");
      return;
    }
    const payload = {
      nome: values.nome,
      tipo: values.tipo,
      antecedenciaMinutos: values.tipo === "antecedencia" ? values.antecedenciaMinutos : null,
      destinatarios: values.destinatarios,
      canais: ["whatsapp"] as CanalLembrete[],
      templateWhatsappId: values.templateWhatsappId,
      templateEmailId: null,
      ativo: values.ativo,
      ordem: regra?.ordem ?? 10,
    };
    try {
      if (regra) await atualizarRegraLembreteApi(regra.id, payload);
      else await criarRegraLembreteApi(payload);
      toast.success(regra ? "Regra atualizada." : "Regra criada.");
      await onSalvo();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar a regra.");
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{regra ? "Editar regra" : "Nova regra"}</DialogTitle>
          <DialogDescription>A regra só dispara a partir de um agendamento existente.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id="regra-form" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormSection title="Regra" columns={1}>
              <FormField label="Nome" htmlFor="nome" error={form.formState.errors.nome?.message}>
                <Input id="nome" disabled={!podeEditar} {...form.register("nome")} />
              </FormField>
              <FormField label="Tipo">
                <Select value={tipo} disabled={!podeEditar} onValueChange={(valor) => form.setValue("tipo", valor as FormValues["tipo"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecedencia">Antecedência</SelectItem>
                    <SelectItem value="confirmacao">Após confirmação</SelectItem>
                    <SelectItem value="reagendamento">Reagendamento</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              {tipo === "antecedencia" ? (
                <FormField label="Minutos antes" htmlFor="antecedenciaMinutos">
                  <Input
                    id="antecedenciaMinutos"
                    type="number"
                    disabled={!podeEditar}
                    value={form.watch("antecedenciaMinutos") ?? 0}
                    onChange={(event) => form.setValue("antecedenciaMinutos", Number(event.target.value))}
                  />
                </FormField>
              ) : null}
              <FormField label="Destinatários">
                <Select
                  value={form.watch("destinatarios")}
                  disabled={!podeEditar}
                  onValueChange={(valor) => form.setValue("destinatarios", valor as FormValues["destinatarios"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paciente">Paciente</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="ambos">Paciente e profissional</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Template WhatsApp">
                <Select
                  value={form.watch("templateWhatsappId") ?? ""}
                  disabled={!podeEditar}
                  onValueChange={(valor) => form.setValue("templateWhatsappId", valor)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {templates.filter((item) => item.canal === "whatsapp").map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <label className="flex items-center justify-between text-sm">
                Ativa
                <Switch checked={form.watch("ativo")} disabled={!podeEditar} onCheckedChange={(valor) => form.setValue("ativo", valor)} />
              </label>
            </FormSection>
          </form>
        </DialogBody>
        <DialogFooter>
          {regra && onExcluir ? (
            <Button type="button" variant="destructive" onClick={onExcluir}>
              Excluir
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {podeEditar ? (
            <Button type="submit" form="regra-form" loading={form.formState.isSubmitting}>
              Salvar
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
