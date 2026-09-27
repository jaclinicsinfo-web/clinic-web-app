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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import { atualizarTemplateMensagemApi, criarTemplateMensagemApi, type TemplateMensagem } from "@/services/integracoes";

const schema = z.object({
  nome: z.string().min(3, "Informe o nome."),
  tipo: z.enum(["antecedencia", "confirmacao", "reagendamento", "cancelamento"]),
  corpo: z.string().min(3, "Informe o conteúdo."),
  whatsappNomeTemplate: z.string(),
  whatsappIdioma: z.string(),
  whatsappCategoria: z.enum(["utility", "marketing", "authentication", "service"]),
  ativo: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function TemplateDialog({
  template,
  onOpenChange,
  onSalvo,
  onExcluir,
}: {
  template: TemplateMensagem | null;
  onOpenChange: (aberto: boolean) => void;
  onSalvo: () => void | Promise<void>;
  onExcluir?: () => void;
}) {
  const sessao = useSessaoStore((state) => state.sessao);
  const podeEditar = temPermissao(sessao?.permissoes, "integracoes", template ? "editar" : "criar");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: template
      ? {
          nome: template.nome,
          tipo: template.tipo,
          corpo: template.corpo,
          whatsappNomeTemplate: template.whatsappNomeTemplate ?? "",
          whatsappIdioma: template.whatsappIdioma,
          whatsappCategoria: (template.whatsappCategoria as FormValues["whatsappCategoria"]) || "utility",
          ativo: template.ativo,
        }
      : {
          nome: "",
          tipo: "antecedencia",
          corpo: "Olá {{paciente.nome}}, sua consulta com {{profissional.nome}} é em {{data}} às {{horario}}.",
          whatsappNomeTemplate: "",
          whatsappIdioma: "pt_BR",
          whatsappCategoria: "utility",
          ativo: true,
        },
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      canal: "whatsapp" as const,
      assunto: null,
      whatsappNomeTemplate: values.whatsappNomeTemplate || null,
    };
    try {
      if (template) await atualizarTemplateMensagemApi(template.id, payload);
      else await criarTemplateMensagemApi(payload);
      toast.success(template ? "Template atualizado." : "Template criado.");
      await onSalvo();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o template.");
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template ? "Editar template" : "Novo template"}</DialogTitle>
          <DialogDescription>
            No WhatsApp, o nome precisa coincidir com o template aprovado na Meta. Os placeholders viram variáveis na ordem em que aparecem.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id="template-form" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormSection title="Conteúdo" columns={1}>
              <FormField label="Nome" htmlFor="nome" error={form.formState.errors.nome?.message}>
                <Input id="nome" disabled={!podeEditar} {...form.register("nome")} />
              </FormField>
              <FormField label="Tipo de evento">
                <Select value={form.watch("tipo")} disabled={!podeEditar} onValueChange={(valor) => form.setValue("tipo", valor as FormValues["tipo"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecedencia">Antecedência</SelectItem>
                    <SelectItem value="confirmacao">Confirmação</SelectItem>
                    <SelectItem value="reagendamento">Reagendamento</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Nome do template na Meta" htmlFor="whatsappNomeTemplate" hint="Ex.: lembrete_consulta (já aprovado).">
                <Input id="whatsappNomeTemplate" disabled={!podeEditar} {...form.register("whatsappNomeTemplate")} />
              </FormField>
              <FormField label="Idioma" htmlFor="whatsappIdioma">
                <Input id="whatsappIdioma" disabled={!podeEditar} {...form.register("whatsappIdioma")} />
              </FormField>
              <FormField label="Categoria">
                <Select
                  value={form.watch("whatsappCategoria")}
                  disabled={!podeEditar}
                  onValueChange={(valor) => form.setValue("whatsappCategoria", valor as FormValues["whatsappCategoria"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Corpo" htmlFor="corpo" error={form.formState.errors.corpo?.message}>
                <Textarea id="corpo" rows={5} disabled={!podeEditar} {...form.register("corpo")} />
              </FormField>
              <label className="flex items-center justify-between text-sm">
                Ativo
                <Switch checked={form.watch("ativo")} disabled={!podeEditar} onCheckedChange={(valor) => form.setValue("ativo", valor)} />
              </label>
            </FormSection>
          </form>
        </DialogBody>
        <DialogFooter>
          {onExcluir ? (
            <Button type="button" variant="destructive" onClick={onExcluir}>
              Excluir
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {podeEditar ? (
            <Button type="submit" form="template-form" loading={form.formState.isSubmitting}>
              Salvar
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
