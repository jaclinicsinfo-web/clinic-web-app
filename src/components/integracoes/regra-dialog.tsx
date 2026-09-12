"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormField, FormSection } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  whatsapp: z.boolean(),
  email: z.boolean(),
  templateWhatsappId: z.string().nullable(),
  templateEmailId: z.string().nullable(),
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
          whatsapp: regra.canais.includes("whatsapp"),
          email: regra.canais.includes("email"),
          templateWhatsappId: regra.templateWhatsappId,
          templateEmailId: regra.templateEmailId,
          ativo: regra.ativo,
        }
      : {
          nome: "",
          tipo: "antecedencia",
          antecedenciaMinutos: 1440,
          destinatarios: "paciente",
          whatsapp: true,
          email: true,
          templateWhatsappId: templates.find((item) => item.canal === "whatsapp")?.id ?? null,
          templateEmailId: templates.find((item) => item.canal === "email")?.id ?? null,
          ativo: true,
        },
  });

  const tipo = form.watch("tipo");
  const usaWhatsapp = form.watch("whatsapp");
  const usaEmail = form.watch("email");

  async function onSubmit(values: FormValues) {
    const canais: CanalLembrete[] = [];
    if (values.whatsapp) canais.push("whatsapp");
    if (values.email) canais.push("email");
    if (canais.length === 0) {
      toast.error("Selecione ao menos um canal.");
      return;
    }
    const payload = {
      nome: values.nome,
      tipo: values.tipo,
      antecedenciaMinutos: values.tipo === "antecedencia" ? values.antecedenciaMinutos : null,
      destinatarios: values.destinatarios,
      canais,
      templateWhatsappId: values.whatsapp ? values.templateWhatsappId : null,
      templateEmailId: values.email ? values.templateEmailId : null,
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
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={usaWhatsapp} disabled={!podeEditar} onCheckedChange={(valor) => form.setValue("whatsapp", Boolean(valor))} />
                  WhatsApp
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={usaEmail} disabled={!podeEditar} onCheckedChange={(valor) => form.setValue("email", Boolean(valor))} />
                  E-mail
                </label>
              </div>
              {usaWhatsapp ? (
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
              ) : null}
              {usaEmail ? (
                <FormField label="Template de e-mail">
                  <Select
                    value={form.watch("templateEmailId") ?? ""}
                    disabled={!podeEditar}
                    onValueChange={(valor) => form.setValue("templateEmailId", valor)}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {templates.filter((item) => item.canal === "email").map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              ) : null}
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
