"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormField, FormSection } from "@/components/shared/form-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatCpf, formatCurrency, formatMinutes, formatPhone } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import { temPermissao } from "@/lib/permissoes";
import { diasSemana, formaRemuneracaoLabels, tipoVinculoLabels } from "@/lib/status";
import { useSessaoStore } from "@/hooks/use-sessao";
import { atualizarProfissionalApi, criarProfissionalApi, type UsuarioVinculo } from "@/services/profissionais";
import type { Profissional } from "@/types";

const conselhos = ["CRM", "CRO", "CREFITO", "CRN", "CRP", "COREN"];

const gradeSchema = z.object({
  ativo: z.boolean(),
  horaInicio: z.string(),
  horaFim: z.string(),
});

const profissionalSchema = z
  .object({
    nome: z.string().min(3, "Informe o nome completo."),
    cpf: z.string().min(14, "Informe um CPF válido."),
    rg: z.string(),
    email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
    telefone: z.string().min(14, "Informe um telefone válido."),
    especialidades: z.array(z.string()).min(1, "Selecione ao menos uma especialidade."),
    conselho: z.string().min(1, "Selecione o conselho de classe."),
    registroConselho: z.string().min(3, "Informe o número do registro."),
    tipoVinculo: z.enum(["clt", "pj", "autonomo"]),
    dataAdmissao: z.string().min(1, "Informe a data de admissão."),
    formaRemuneracao: z.enum(["fixo", "comissao", "misto"]),
    percentualComissao: z.number().min(0, "O percentual não pode ser negativo.").max(100, "O percentual máximo é 100%."),
    comissaoPorProcedimento: z.boolean(),
    gradeHorarios: z.array(gradeSchema).length(7),
    usuarioId: z.string(),
    procedimentosHabilitados: z.array(z.string()).min(1, "Habilite ao menos um procedimento."),
  })
  .superRefine((values, ctx) => {
    if (values.formaRemuneracao !== "fixo" && values.percentualComissao <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o percentual de comissão para esta forma de remuneração.",
        path: ["percentualComissao"],
      });
    }

    values.gradeHorarios.forEach((grade, index) => {
      if (grade.ativo && grade.horaFim <= grade.horaInicio) {
        ctx.addIssue({
          code: "custom",
          message: "O horário final deve ser posterior ao inicial.",
          path: ["gradeHorarios", index, "horaFim"],
        });
      }
    });

    if (!values.gradeHorarios.some((grade) => grade.ativo)) {
      ctx.addIssue({
        code: "custom",
        message: "Defina ao menos um dia de atendimento na grade semanal.",
        path: ["gradeHorarios"],
      });
    }
  });

type ProfissionalFormValues = z.infer<typeof profissionalSchema>;

interface ProfissionalFormProps {
  especialidades: string[];
  procedimentos: { id: string; nome: string; categoria: string; duracaoPadraoMin: number; valorParticular: number }[];
  usuarios?: UsuarioVinculo[];
  profissional?: Profissional;
}

const gradePadrao: ProfissionalFormValues["gradeHorarios"] = diasSemana.map((_, index) => ({
  ativo: index >= 1 && index <= 5,
  horaInicio: "08:00",
  horaFim: "18:00",
}));

function valoresIniciais(profissional?: Profissional): ProfissionalFormValues {
  if (!profissional) {
    return {
      nome: "",
      cpf: "",
      rg: "",
      email: "",
      telefone: "",
      especialidades: [],
      conselho: "",
      registroConselho: "",
      tipoVinculo: "pj",
      dataAdmissao: "",
      formaRemuneracao: "comissao",
      percentualComissao: 40,
      comissaoPorProcedimento: false,
      gradeHorarios: gradePadrao,
      procedimentosHabilitados: [],
      usuarioId: "",
    };
  }

  return {
    nome: profissional.nome,
    cpf: formatCpf(profissional.cpf),
    rg: profissional.rg ?? "",
    email: profissional.email,
    telefone: formatPhone(profissional.telefone),
    especialidades: profissional.especialidades,
    conselho: profissional.conselho,
    registroConselho: profissional.registroConselho,
    tipoVinculo: profissional.tipoVinculo,
    dataAdmissao: profissional.dataAdmissao,
    formaRemuneracao: profissional.formaRemuneracao,
    percentualComissao: profissional.percentualComissao,
    comissaoPorProcedimento: profissional.comissaoPorProcedimento ?? false,
    gradeHorarios: diasSemana.map((_, index) => {
      const grade = profissional.gradeHorarios.find((item) => item.diaSemana === index);
      return {
        ativo: Boolean(grade),
        horaInicio: grade?.horaInicio ?? "08:00",
        horaFim: grade?.horaFim ?? "18:00",
      };
    }),
    procedimentosHabilitados: profissional.procedimentosHabilitados,
    usuarioId: profissional.usuarioId ?? "",
  };
}

export function ProfissionalForm({ especialidades, procedimentos, usuarios = [], profissional }: ProfissionalFormProps) {
  const router = useRouter();
  const edicao = Boolean(profissional);
  const sessao = useSessaoStore((state) => state.sessao);
  const mostraFinanceiro =
    planoIncluiModulo(sessao?.plano, "financeiro") && temPermissao(sessao?.permissoes, "financeiro");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfissionalFormValues>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: valoresIniciais(profissional),
  });

  React.useEffect(() => {
    reset(valoresIniciais(profissional));
  }, [profissional, reset]);

  const especialidadesSelecionadas = watch("especialidades");
  const procedimentosSelecionados = watch("procedimentosHabilitados");
  const grade = watch("gradeHorarios");
  const formaRemuneracao = watch("formaRemuneracao");

  const categorias = React.useMemo(() => {
    const agrupado = new Map<string, ProfissionalFormProps["procedimentos"]>();
    for (const procedimento of procedimentos) {
      const lista = agrupado.get(procedimento.categoria) ?? [];
      lista.push(procedimento);
      agrupado.set(procedimento.categoria, lista);
    }
    return [...agrupado.entries()];
  }, [procedimentos]);

  function alternarEspecialidade(item: string, marcado: boolean) {
    const atual = especialidadesSelecionadas ?? [];
    setValue("especialidades", marcado ? [...atual, item] : atual.filter((valor) => valor !== item), {
      shouldValidate: true,
    });
  }

  function alternarProcedimento(id: string, marcado: boolean) {
    const atual = procedimentosSelecionados ?? [];
    setValue("procedimentosHabilitados", marcado ? [...atual, id] : atual.filter((valor) => valor !== id), {
      shouldValidate: true,
    });
  }

  async function onSubmit(values: ProfissionalFormValues) {
    const payload = {
      nome: values.nome,
      cpf: values.cpf,
      rg: values.rg.trim() ? values.rg.trim() : null,
      email: values.email,
      telefone: values.telefone,
      especialidades: values.especialidades,
      conselho: values.conselho,
      registroConselho: values.registroConselho,
      tipoVinculo: values.tipoVinculo,
      dataAdmissao: values.dataAdmissao,
      formaRemuneracao: values.formaRemuneracao,
      percentualComissao: values.percentualComissao,
      comissaoPorProcedimento: values.comissaoPorProcedimento,
      procedimentosHabilitados: values.procedimentosHabilitados,
      gradeHorarios: values.gradeHorarios
        .map((grade, diaSemana) => ({
          diaSemana,
          horaInicio: grade.horaInicio,
          horaFim: grade.horaFim,
          ativo: grade.ativo,
        }))
        .filter((grade) => grade.ativo)
        .map(({ diaSemana, horaInicio, horaFim }) => ({
          diaSemana: diaSemana as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          horaInicio,
          horaFim,
        })),
      usuarioId: values.usuarioId ? values.usuarioId : null,
      status: profissional?.status ?? "ativo",
    };

    try {
      if (profissional) {
        await atualizarProfissionalApi(profissional.id, payload);
        toast.success("Profissional atualizado", { description: values.nome });
        router.push(`/profissionais/${profissional.id}`);
      } else {
        const criado = await criarProfissionalApi(payload);
        toast.success("Profissional cadastrado", {
          description: `${values.nome} já pode receber agendamentos.`,
        });
        router.push(`/profissionais/${criado.id}`);
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o profissional.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-thin">
      <Card className="flex flex-col gap-6 p-6">
        <FormSection
          title="Dados pessoais"
          description="Identificação e contato do profissional."
        >
          <FormField label="Nome completo" htmlFor="nome" error={errors.nome?.message} required full>
            <Input
              id="nome"
              placeholder="Dra. Helena Marques"
              aria-invalid={Boolean(errors.nome)}
              {...register("nome")}
            />
          </FormField>

          <FormField label="CPF" htmlFor="cpf" error={errors.cpf?.message} required>
            <Input
              id="cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              aria-invalid={Boolean(errors.cpf)}
              {...register("cpf", {
                onChange: (event) => setValue("cpf", formatCpf(event.target.value)),
              })}
            />
          </FormField>

          <FormField label="RG" htmlFor="rg" error={errors.rg?.message}>
            <Input id="rg" placeholder="00.000.000-0" {...register("rg")} />
          </FormField>

          <FormField label="E-mail" htmlFor="email" error={errors.email?.message} required>
            <Input
              id="email"
              type="email"
              placeholder="nome@clinica.com.br"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </FormField>

          <FormField label="Telefone" htmlFor="telefone" error={errors.telefone?.message} required>
            <Input
              id="telefone"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              aria-invalid={Boolean(errors.telefone)}
              {...register("telefone", {
                onChange: (event) => setValue("telefone", formatPhone(event.target.value)),
              })}
            />
          </FormField>

          <FormField
            label="Conta de login"
            hint="Opcional. Vincula o cadastro clínico ao usuário com perfil de profissional de saúde."
            full
          >
            <Select
              value={watch("usuarioId") || "nenhuma"}
              onValueChange={(valor) => setValue("usuarioId", valor === "nenhuma" ? "" : valor)}
            >
              <SelectTrigger aria-label="Conta de login">
                <SelectValue placeholder="Sem vínculo de login" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Sem vínculo de login</SelectItem>
                {usuarios
                  .filter((item) => !item.ocupado || item.id === profissional?.usuarioId)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome} · {item.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </FormField>

        </FormSection>

        <FormSection
          title="Dados profissionais"
          description="Especialidades e registro no conselho de classe."
        >
          <FormField
            label="Especialidades"
            error={errors.especialidades?.message}
            hint="Definem em quais agendas o profissional pode ser escalado."
            required
            full
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {especialidades.map((item) => {
                const id = `especialidade-${item}`;
                return (
                  <label
                    key={item}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <Checkbox
                      id={id}
                      checked={especialidadesSelecionadas?.includes(item)}
                      onCheckedChange={(checked) => alternarEspecialidade(item, Boolean(checked))}
                    />
                    <span className="text-sm text-foreground">{item}</span>
                  </label>
                );
              })}
            </div>
          </FormField>

          <FormField label="Conselho de classe" error={errors.conselho?.message} required>
            <Select value={watch("conselho")} onValueChange={(valor) => setValue("conselho", valor, { shouldValidate: true })}>
              <SelectTrigger aria-label="Conselho de classe">
                <SelectValue placeholder="Selecione o conselho" />
              </SelectTrigger>
              <SelectContent>
                {conselhos.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Número do registro"
            htmlFor="registroConselho"
            error={errors.registroConselho?.message}
            required
          >
            <Input
              id="registroConselho"
              placeholder="SP 128456"
              aria-invalid={Boolean(errors.registroConselho)}
              {...register("registroConselho")}
            />
          </FormField>
        </FormSection>

        <FormSection title="Vínculo" description="Contrato e forma de remuneração acordada." columns={3}>
          <FormField label="Tipo de contrato" error={errors.tipoVinculo?.message} required>
            <Select
              value={watch("tipoVinculo")}
              onValueChange={(valor) => setValue("tipoVinculo", valor as ProfissionalFormValues["tipoVinculo"])}
            >
              <SelectTrigger aria-label="Tipo de contrato">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tipoVinculoLabels).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Data de admissão" htmlFor="dataAdmissao" error={errors.dataAdmissao?.message} required>
            <Input
              id="dataAdmissao"
              type="date"
              aria-invalid={Boolean(errors.dataAdmissao)}
              {...register("dataAdmissao")}
            />
          </FormField>

          <FormField label="Forma de remuneração" error={errors.formaRemuneracao?.message} required>
            <Select
              value={formaRemuneracao}
              onValueChange={(valor) =>
                setValue("formaRemuneracao", valor as ProfissionalFormValues["formaRemuneracao"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger aria-label="Forma de remuneração">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(formaRemuneracaoLabels).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </FormSection>

        {mostraFinanceiro && (
        <FormSection title="Comissionamento" description="Percentual aplicado sobre o faturamento gerado.">
          <FormField
            label="Percentual de comissão"
            htmlFor="percentualComissao"
            error={errors.percentualComissao?.message}
            hint={formaRemuneracao === "fixo" ? "Não se aplica a profissionais com remuneração fixa." : undefined}
          >
            <div className="relative">
              <Input
                id="percentualComissao"
                type="number"
                min={0}
                max={100}
                step={0.5}
                className="pr-8 text-right tabular-nums"
                disabled={formaRemuneracao === "fixo"}
                aria-invalid={Boolean(errors.percentualComissao)}
                {...register("percentualComissao", { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </FormField>

          <FormField
            label="Tabela customizada"
            hint="Permite definir percentuais diferentes por procedimento no fechamento da comissão."
          >
            <div className="flex h-10 items-center gap-3">
              <Switch
                id="comissaoPorProcedimento"
                checked={watch("comissaoPorProcedimento")}
                onCheckedChange={(checked) => setValue("comissaoPorProcedimento", checked)}
                disabled={formaRemuneracao === "fixo"}
              />
              <Label htmlFor="comissaoPorProcedimento" className="font-normal text-muted-foreground">
                Comissão por procedimento
              </Label>
            </div>
          </FormField>
        </FormSection>
        )}

        <FormSection
          title="Horários de atendimento"
          description="Grade semanal usada para calcular a disponibilidade na agenda."
          columns={1}
        >
          <div className="space-y-2">
            {diasSemana.map((dia, index) => {
              const ativo = grade?.[index]?.ativo ?? false;
              const erroHora = errors.gradeHorarios?.[index]?.horaFim?.message;

              return (
                <div
                  key={dia}
                  className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div className="flex w-40 shrink-0 items-center gap-3">
                    <Switch
                      id={`dia-${index}`}
                      checked={ativo}
                      onCheckedChange={(checked) =>
                        setValue(`gradeHorarios.${index}.ativo`, checked, { shouldValidate: true })
                      }
                    />
                    <Label htmlFor={`dia-${index}`} className="font-normal">
                      {dia}
                    </Label>
                  </div>

                  {ativo ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <Input
                        type="time"
                        className="w-32"
                        aria-label={`Hora de início de ${dia}`}
                        {...register(`gradeHorarios.${index}.horaInicio`)}
                      />
                      <span className="text-sm text-muted-foreground">até</span>
                      <Input
                        type="time"
                        className="w-32"
                        aria-label={`Hora de término de ${dia}`}
                        aria-invalid={Boolean(erroHora)}
                        {...register(`gradeHorarios.${index}.horaFim`)}
                      />
                      {erroHora && <span className="text-xs text-destructive">{erroHora}</span>}
                    </div>
                  ) : (
                    <span className="flex-1 text-sm text-muted-foreground">Sem atendimento</span>
                  )}
                </div>
              );
            })}
            {errors.gradeHorarios?.message && (
              <p className="text-xs text-destructive">{errors.gradeHorarios.message}</p>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Procedimentos habilitados"
          description="Somente os procedimentos marcados ficam disponíveis ao agendar com este profissional."
          columns={1}
        >
          <div className="space-y-5">
            {categorias.map(([categoria, itens]) => (
              <div key={categoria}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{categoria}</h3>
                  <Badge tone="outline">{itens.length}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {itens.map((procedimento) => {
                    const id = `procedimento-${procedimento.id}`;
                    return (
                      <label
                        key={procedimento.id}
                        htmlFor={id}
                        className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                      >
                        <Checkbox
                          id={id}
                          className="mt-0.5"
                          checked={procedimentosSelecionados?.includes(procedimento.id)}
                          onCheckedChange={(checked) => alternarProcedimento(procedimento.id, Boolean(checked))}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-foreground">{procedimento.nome}</span>
                          <span className="block text-xs text-muted-foreground">
                            {formatMinutes(procedimento.duracaoPadraoMin)} ·{" "}
                            {formatCurrency(procedimento.valorParticular)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            {errors.procedimentosHabilitados?.message && (
              <p className="text-xs text-destructive">{errors.procedimentosHabilitados.message}</p>
            )}
          </div>
        </FormSection>
      </Card>
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/profissionais">Cancelar</Link>
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {edicao ? "Salvar alterações" : "Salvar profissional"}
        </Button>
      </div>
    </form>
  );
}
