"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatPhone } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { criarConvenioApi } from "@/services/convenios";

const convenioSchema = z.object({
  nome: z.string().min(3, "Informe o nome do convênio."),
  registroAns: z.string().min(4, "Informe o registro ANS."),
  prazoPagamentoDias: z
    .number()
    .min(1, "O prazo deve ser de ao menos 1 dia.")
    .max(180, "O prazo máximo é de 180 dias."),
  exigeAutorizacaoPrevia: z.boolean(),
  contatoNome: z.string().min(3, "Informe o contato do convênio."),
  contatoTelefone: z.string().min(14, "Informe um telefone válido."),
  portalUrl: z.string(),
  status: z.enum(["ativo", "inativo"]),
});

type ConvenioFormValues = z.infer<typeof convenioSchema>;

export function NovoConvenioDialog({ onCriado }: { onCriado?: () => void }) {
  const [aberto, setAberto] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConvenioFormValues>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      nome: "",
      registroAns: "",
      prazoPagamentoDias: 30,
      exigeAutorizacaoPrevia: false,
      contatoNome: "",
      contatoTelefone: "",
      portalUrl: "",
      status: "ativo",
    },
  });

  async function onSubmit(values: ConvenioFormValues) {
    try {
      await criarConvenioApi({
        ...values,
        contatoTelefone: values.contatoTelefone.replace(/\D/g, ""),
        portalUrl: values.portalUrl.trim() ? values.portalUrl.trim() : null,
      });
      toast.success("Convênio cadastrado", {
        description: `${values.nome} já pode ser vinculado a pacientes e agendamentos.`,
      });
      reset();
      setAberto(false);
      onCriado?.();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível cadastrar o convênio.");
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(estado) => {
        setAberto(estado);
        if (!estado) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo convênio
        </Button>
      </DialogTrigger>

      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Novo convênio</DialogTitle>
          <DialogDescription>
            A tabela de preços por procedimento é configurada depois, na página do convênio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-6">
            <FormSection title="Identificação" description="Dados cadastrais da operadora.">
              <FormField label="Nome do convênio" htmlFor="nome" error={errors.nome?.message} required>
                <Input id="nome" placeholder="Unimed" aria-invalid={Boolean(errors.nome)} {...register("nome")} />
              </FormField>

              <FormField label="Registro ANS" htmlFor="registroAns" error={errors.registroAns?.message} required>
                <Input
                  id="registroAns"
                  inputMode="numeric"
                  placeholder="393321"
                  aria-invalid={Boolean(errors.registroAns)}
                  {...register("registroAns")}
                />
              </FormField>

              <FormField label="Status" error={errors.status?.message} required>
                <Select
                  value={watch("status")}
                  onValueChange={(valor) => setValue("status", valor as ConvenioFormValues["status"])}
                >
                  <SelectTrigger aria-label="Status do convênio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Prazo de pagamento"
                htmlFor="prazoPagamentoDias"
                error={errors.prazoPagamentoDias?.message}
                hint="Prazo médio entre o envio do lote e o crédito."
                required
              >
                <div className="relative">
                  <Input
                    id="prazoPagamentoDias"
                    type="number"
                    min={1}
                    max={180}
                    className="pr-14 text-right tabular-nums"
                    aria-invalid={Boolean(errors.prazoPagamentoDias)}
                    {...register("prazoPagamentoDias", { valueAsNumber: true })}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    dias
                  </span>
                </div>
              </FormField>
            </FormSection>

            <FormSection title="Contato e portal" description="Canal usado pela recepção e pelo faturamento.">
              <FormField label="Contato" htmlFor="contatoNome" error={errors.contatoNome?.message} required>
                <Input
                  id="contatoNome"
                  placeholder="Central de Relacionamento"
                  aria-invalid={Boolean(errors.contatoNome)}
                  {...register("contatoNome")}
                />
              </FormField>

              <FormField label="Telefone" htmlFor="contatoTelefone" error={errors.contatoTelefone?.message} required>
                <Input
                  id="contatoTelefone"
                  inputMode="numeric"
                  placeholder="(00) 0000-0000"
                  aria-invalid={Boolean(errors.contatoTelefone)}
                  {...register("contatoTelefone", {
                    onChange: (event) => setValue("contatoTelefone", formatPhone(event.target.value)),
                  })}
                />
              </FormField>

              <FormField label="Portal do prestador" htmlFor="portalUrl" error={errors.portalUrl?.message} full>
                <Input id="portalUrl" placeholder="https://portal.operadora.com.br" {...register("portalUrl")} />
              </FormField>
            </FormSection>

            <FormSection title="Regras de atendimento" description="Condições aplicadas no agendamento." columns={1}>
              <div className="flex items-start gap-3 rounded-lg border border-border px-4 py-3">
                <Switch
                  id="exigeAutorizacaoPrevia"
                  className="mt-0.5"
                  checked={watch("exigeAutorizacaoPrevia")}
                  onCheckedChange={(checked) => setValue("exigeAutorizacaoPrevia", checked)}
                />
                <div>
                  <Label htmlFor="exigeAutorizacaoPrevia">Exige autorização prévia</Label>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    A recepção precisa registrar o número da senha antes de confirmar o agendamento.
                  </p>
                </div>
              </div>
            </FormSection>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Salvar convênio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
