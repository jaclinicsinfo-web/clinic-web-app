"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormSection } from "@/components/shared/form-section";
import { TagsInput } from "@/components/shared/tags-input";
import { estadoCivilLabels, sexoLabels } from "@/lib/status";
import { formatCep, formatCpf, formatPhone } from "@/lib/format";
import { cpfValido } from "@/lib/validacao";
import { ApiError } from "@/lib/api";
import {
  atualizarPacienteApi,
  criarPacienteApi,
  type PacientePayload,
} from "@/services/pacientes";
import type { Paciente } from "@/types";

const enderecoSchema = z.object({
  cep: z.string().min(9, "CEP incompleto."),
  rua: z.string().min(3, "Informe o logradouro."),
  numero: z.string().min(1, "Informe o número."),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Informe o bairro."),
  cidade: z.string().min(2, "Informe a cidade."),
  uf: z.string().length(2, "UF deve ter 2 letras."),
});

const pacienteSchema = z
  .object({
    nome: z.string().min(5, "Informe o nome completo."),
    cpf: z
      .string()
      .min(14, "CPF incompleto.")
      .refine((valor) => cpfValido(valor), "CPF inválido."),
    rg: z.string().optional(),
    dataNascimento: z.string().min(1, "Informe a data de nascimento."),
    sexo: z.enum(["masculino", "feminino", "outro"]),
    estadoCivil: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]).optional(),
    profissao: z.string().optional(),

    telefone: z.string().min(14, "Telefone incompleto."),
    whatsapp: z.string().optional(),
    email: z.string().email("E-mail inválido.").or(z.literal("")).optional(),
    endereco: enderecoSchema,

    convenioId: z.string(),
    numeroCarteirinha: z.string().optional(),
    validadeCarteirinha: z.string().optional(),

    temResponsavel: z.boolean(),
    responsavelNome: z.string().optional(),
    responsavelCpf: z.string().optional(),
    responsavelParentesco: z.string().optional(),
    responsavelTelefone: z.string().optional(),

    alergias: z.array(z.string()),
    condicoesPreexistentes: z.array(z.string()),
    medicacoesEmUso: z.array(z.string()),

    profissionalPreferidoId: z.string(),
    formaContatoPreferida: z.enum(["whatsapp", "telefone", "email"]),
    observacoes: z.string().optional(),

    consentimentoLgpd: z.boolean(),
    autorizacaoImagem: z.boolean(),
  })
  .refine((dados) => dados.consentimentoLgpd, {
    message: "O aceite do termo de LGPD é obrigatório para concluir o cadastro.",
    path: ["consentimentoLgpd"],
  })
  .refine((dados) => !dados.temResponsavel || (dados.responsavelNome ?? "").length >= 5, {
    message: "Informe o nome do responsável.",
    path: ["responsavelNome"],
  })
  .refine((dados) => dados.convenioId === "particular" || (dados.numeroCarteirinha ?? "").length > 0, {
    message: "Informe o número da carteirinha.",
    path: ["numeroCarteirinha"],
  });

type PacienteFormValues = z.infer<typeof pacienteSchema>;

interface PacienteFormProps {
  convenios: { id: string; nome: string }[];
  profissionais: { id: string; nome: string }[];
  paciente?: Paciente;
}

function toFormValues(paciente?: Paciente): PacienteFormValues {
  if (!paciente) {
    return {
      nome: "",
      cpf: "",
      rg: "",
      dataNascimento: "",
      sexo: "feminino",
      estadoCivil: undefined,
      profissao: "",
      telefone: "",
      whatsapp: "",
      email: "",
      endereco: { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" },
      convenioId: "particular",
      numeroCarteirinha: "",
      validadeCarteirinha: "",
      temResponsavel: false,
      responsavelNome: "",
      responsavelCpf: "",
      responsavelParentesco: "",
      responsavelTelefone: "",
      alergias: [],
      condicoesPreexistentes: [],
      medicacoesEmUso: [],
      profissionalPreferidoId: "nenhum",
      formaContatoPreferida: "whatsapp",
      observacoes: "",
      consentimentoLgpd: false,
      autorizacaoImagem: false,
    };
  }

  return {
    nome: paciente.nome,
    cpf: formatCpf(paciente.cpf),
    rg: paciente.rg ?? "",
    dataNascimento: paciente.dataNascimento,
    sexo: paciente.sexo,
    estadoCivil: paciente.estadoCivil,
    profissao: paciente.profissao ?? "",
    telefone: formatPhone(paciente.telefone),
    whatsapp: paciente.whatsapp ? formatPhone(paciente.whatsapp) : "",
    email: paciente.email ?? "",
    endereco: {
      cep: formatCep(paciente.endereco.cep),
      rua: paciente.endereco.rua,
      numero: paciente.endereco.numero,
      complemento: paciente.endereco.complemento ?? "",
      bairro: paciente.endereco.bairro,
      cidade: paciente.endereco.cidade,
      uf: paciente.endereco.uf,
    },
    convenioId: paciente.convenioId ?? "particular",
    numeroCarteirinha: paciente.numeroCarteirinha ?? "",
    validadeCarteirinha: paciente.validadeCarteirinha ?? "",
    temResponsavel: Boolean(paciente.responsavel),
    responsavelNome: paciente.responsavel?.nome ?? "",
    responsavelCpf: paciente.responsavel ? formatCpf(paciente.responsavel.cpf) : "",
    responsavelParentesco: paciente.responsavel?.parentesco ?? "",
    responsavelTelefone: paciente.responsavel ? formatPhone(paciente.responsavel.telefone) : "",
    alergias: paciente.alergias,
    condicoesPreexistentes: paciente.condicoesPreexistentes,
    medicacoesEmUso: paciente.medicacoesEmUso,
    profissionalPreferidoId: paciente.profissionalPreferidoId ?? "nenhum",
    formaContatoPreferida: paciente.formaContatoPreferida ?? "whatsapp",
    observacoes: paciente.observacoes ?? "",
    consentimentoLgpd: paciente.consentimentoLgpd,
    autorizacaoImagem: paciente.autorizacaoImagem,
  };
}

export function PacienteForm({ convenios, profissionais, paciente }: PacienteFormProps) {
  const router = useRouter();
  const [buscandoCep, setBuscandoCep] = React.useState(false);
  const edicao = Boolean(paciente);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: toFormValues(paciente),
  });

  const convenioSelecionado = watch("convenioId");
  const temResponsavel = watch("temResponsavel");

  async function buscarCep(cep: string) {
    const digitos = cep.replace(/\D/g, "");
    if (digitos.length !== 8) return;

    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const dados = (await resposta.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (dados.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      setValue("endereco.rua", dados.logradouro ?? "");
      setValue("endereco.bairro", dados.bairro ?? "");
      setValue("endereco.cidade", dados.localidade ?? "");
      setValue("endereco.uf", dados.uf ?? "");
    } catch {
      toast.error("Não foi possível consultar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function onSubmit(values: PacienteFormValues) {
    const payload: PacientePayload = {
      nome: values.nome,
      cpf: values.cpf,
      rg: values.rg || null,
      dataNascimento: values.dataNascimento,
      sexo: values.sexo,
      estadoCivil: values.estadoCivil ?? null,
      profissao: values.profissao || null,
      telefone: values.telefone,
      whatsapp: values.whatsapp || null,
      email: values.email || null,
      endereco: {
        cep: values.endereco.cep,
        rua: values.endereco.rua,
        numero: values.endereco.numero,
        complemento: values.endereco.complemento || undefined,
        bairro: values.endereco.bairro,
        cidade: values.endereco.cidade,
        uf: values.endereco.uf,
      },
      convenioId: values.convenioId === "particular" ? null : values.convenioId,
      numeroCarteirinha: values.convenioId === "particular" ? null : values.numeroCarteirinha || null,
      validadeCarteirinha:
        values.convenioId === "particular" ? null : values.validadeCarteirinha || null,
      responsavel: values.temResponsavel
        ? {
            nome: values.responsavelNome ?? "",
            cpf: values.responsavelCpf ?? "",
            parentesco: values.responsavelParentesco ?? "",
            telefone: values.responsavelTelefone ?? "",
          }
        : null,
      alergias: values.alergias,
      condicoesPreexistentes: values.condicoesPreexistentes,
      medicacoesEmUso: values.medicacoesEmUso,
      profissionalPreferidoId:
        values.profissionalPreferidoId === "nenhum" ? null : values.profissionalPreferidoId,
      formaContatoPreferida: values.formaContatoPreferida,
      observacoes: values.observacoes || null,
      consentimentoLgpd: values.consentimentoLgpd,
      autorizacaoImagem: values.autorizacaoImagem,
    };

    try {
      if (paciente) {
        await atualizarPacienteApi(paciente.id, payload);
        toast.success("Paciente atualizado", { description: values.nome });
        router.push(`/pacientes/${paciente.id}`);
        return;
      }

      const criado = await criarPacienteApi(payload);
      toast.success("Paciente cadastrado", { description: values.nome });
      router.push(`/pacientes/${criado.id}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o paciente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <FormSection title="Dados pessoais" columns={3}>
            <FormField label="Nome completo" htmlFor="nome" error={errors.nome?.message} required full>
              <Input id="nome" aria-invalid={Boolean(errors.nome)} {...register("nome")} />
            </FormField>

            <FormField label="CPF" htmlFor="cpf" error={errors.cpf?.message} required>
              <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                  <Input
                    id="cpf"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    aria-invalid={Boolean(errors.cpf)}
                    value={field.value}
                    onChange={(event) => field.onChange(formatCpf(event.target.value))}
                  />
                )}
              />
            </FormField>

            <FormField label="RG" htmlFor="rg" error={errors.rg?.message}>
              <Input id="rg" {...register("rg")} />
            </FormField>

            <FormField
              label="Data de nascimento"
              htmlFor="dataNascimento"
              error={errors.dataNascimento?.message}
              required
            >
              <Input
                id="dataNascimento"
                type="date"
                aria-invalid={Boolean(errors.dataNascimento)}
                {...register("dataNascimento")}
              />
            </FormField>

            <FormField label="Sexo" error={errors.sexo?.message} required>
              <Controller
                control={control}
                name="sexo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Sexo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sexoLabels).map(([valor, label]) => (
                        <SelectItem key={valor} value={valor}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Estado civil" error={errors.estadoCivil?.message}>
              <Controller
                control={control}
                name="estadoCivil"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Estado civil">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(estadoCivilLabels).map(([valor, label]) => (
                        <SelectItem key={valor} value={valor}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Profissão" htmlFor="profissao">
              <Input id="profissao" {...register("profissao")} />
            </FormField>
          </FormSection>

          <FormSection title="Contato e endereço" columns={3}>
            <FormField label="Telefone" htmlFor="telefone" error={errors.telefone?.message} required>
              <Controller
                control={control}
                name="telefone"
                render={({ field }) => (
                  <Input
                    id="telefone"
                    inputMode="numeric"
                    placeholder="(00) 0000-0000"
                    aria-invalid={Boolean(errors.telefone)}
                    value={field.value}
                    onChange={(event) => field.onChange(formatPhone(event.target.value))}
                  />
                )}
              />
            </FormField>

            <FormField label="WhatsApp" htmlFor="whatsapp">
              <Controller
                control={control}
                name="whatsapp"
                render={({ field }) => (
                  <Input
                    id="whatsapp"
                    inputMode="numeric"
                    placeholder="(00) 00000-0000"
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(formatPhone(event.target.value))}
                  />
                )}
              />
            </FormField>

            <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
            </FormField>

            <FormField
              label="CEP"
              htmlFor="cep"
              error={errors.endereco?.cep?.message}
              hint="O endereço é preenchido automaticamente."
              required
            >
              <div className="relative">
                <Controller
                  control={control}
                  name="endereco.cep"
                  render={({ field }) => (
                    <Input
                      id="cep"
                      inputMode="numeric"
                      placeholder="00000-000"
                      aria-invalid={Boolean(errors.endereco?.cep)}
                      value={field.value}
                      onChange={(event) => field.onChange(formatCep(event.target.value))}
                      onBlur={(event) => buscarCep(event.target.value)}
                    />
                  )}
                />
                {buscandoCep && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormField>

            <FormField
              label="Logradouro"
              htmlFor="rua"
              error={errors.endereco?.rua?.message}
              required
              className="md:col-span-2"
            >
              <Input id="rua" aria-invalid={Boolean(errors.endereco?.rua)} {...register("endereco.rua")} />
            </FormField>

            <FormField label="Número" htmlFor="numero" error={errors.endereco?.numero?.message} required>
              <Input id="numero" aria-invalid={Boolean(errors.endereco?.numero)} {...register("endereco.numero")} />
            </FormField>

            <FormField label="Complemento" htmlFor="complemento">
              <Input id="complemento" {...register("endereco.complemento")} />
            </FormField>

            <FormField label="Bairro" htmlFor="bairro" error={errors.endereco?.bairro?.message} required>
              <Input id="bairro" aria-invalid={Boolean(errors.endereco?.bairro)} {...register("endereco.bairro")} />
            </FormField>

            <FormField
              label="Cidade"
              htmlFor="cidade"
              error={errors.endereco?.cidade?.message}
              required
              className="md:col-span-2"
            >
              <Input id="cidade" aria-invalid={Boolean(errors.endereco?.cidade)} {...register("endereco.cidade")} />
            </FormField>

            <FormField label="UF" htmlFor="uf" error={errors.endereco?.uf?.message} required>
              <Input id="uf" maxLength={2} aria-invalid={Boolean(errors.endereco?.uf)} {...register("endereco.uf")} />
            </FormField>
          </FormSection>

          <FormSection title="Convênio" description="Deixe como particular quando não houver plano de saúde.">
            <FormField label="Convênio / plano" error={errors.convenioId?.message} required>
              <Controller
                control={control}
                name="convenioId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Convênio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="particular">Particular</SelectItem>
                      {convenios.map((convenio) => (
                        <SelectItem key={convenio.id} value={convenio.id}>
                          {convenio.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {convenioSelecionado !== "particular" && (
              <>
                <FormField
                  label="Número da carteirinha"
                  htmlFor="numeroCarteirinha"
                  error={errors.numeroCarteirinha?.message}
                  required
                >
                  <Input
                    id="numeroCarteirinha"
                    aria-invalid={Boolean(errors.numeroCarteirinha)}
                    {...register("numeroCarteirinha")}
                  />
                </FormField>

                <FormField label="Validade da carteirinha" htmlFor="validadeCarteirinha">
                  <Input id="validadeCarteirinha" type="date" {...register("validadeCarteirinha")} />
                </FormField>
              </>
            )}
          </FormSection>

          <FormSection
            title="Responsável"
            description="Obrigatório para pacientes menores de idade ou dependentes."
            columns={2}
          >
            <div className="flex items-center gap-2 col-span-full">
              <Controller
                control={control}
                name="temResponsavel"
                render={({ field }) => (
                  <Checkbox
                    id="temResponsavel"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                )}
              />
              <Label htmlFor="temResponsavel" className="font-normal">
                Este paciente possui responsável legal
              </Label>
            </div>

            {temResponsavel && (
              <>
                <FormField
                  label="Nome do responsável"
                  htmlFor="responsavelNome"
                  error={errors.responsavelNome?.message}
                  required
                >
                  <Input
                    id="responsavelNome"
                    aria-invalid={Boolean(errors.responsavelNome)}
                    {...register("responsavelNome")}
                  />
                </FormField>

                <FormField label="CPF do responsável" htmlFor="responsavelCpf">
                  <Controller
                    control={control}
                    name="responsavelCpf"
                    render={({ field }) => (
                      <Input
                        id="responsavelCpf"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(formatCpf(event.target.value))}
                      />
                    )}
                  />
                </FormField>

                <FormField label="Parentesco" htmlFor="responsavelParentesco">
                  <Input id="responsavelParentesco" placeholder="Mãe, pai, tutor..." {...register("responsavelParentesco")} />
                </FormField>

                <FormField label="Telefone do responsável" htmlFor="responsavelTelefone">
                  <Controller
                    control={control}
                    name="responsavelTelefone"
                    render={({ field }) => (
                      <Input
                        id="responsavelTelefone"
                        inputMode="numeric"
                        placeholder="(00) 00000-0000"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(formatPhone(event.target.value))}
                      />
                    )}
                  />
                </FormField>
              </>
            )}
          </FormSection>

          <FormSection
            title="Dados clínicos gerais"
            description="Pressione Enter para adicionar cada item."
            columns={3}
          >
            <FormField label="Alergias" htmlFor="alergias">
              <Controller
                control={control}
                name="alergias"
                render={({ field }) => (
                  <TagsInput
                    id="alergias"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ex.: Dipirona"
                  />
                )}
              />
            </FormField>

            <FormField label="Condições preexistentes" htmlFor="condicoes">
              <Controller
                control={control}
                name="condicoesPreexistentes"
                render={({ field }) => (
                  <TagsInput
                    id="condicoes"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ex.: Hipertensão"
                  />
                )}
              />
            </FormField>

            <FormField label="Medicações em uso" htmlFor="medicacoes">
              <Controller
                control={control}
                name="medicacoesEmUso"
                render={({ field }) => (
                  <TagsInput
                    id="medicacoes"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ex.: Losartana 50mg"
                  />
                )}
              />
            </FormField>
          </FormSection>

          <FormSection title="Preferências" columns={2}>
            <FormField label="Profissional preferido">
              <Controller
                control={control}
                name="profissionalPreferidoId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Profissional preferido">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Sem preferência</SelectItem>
                      {profissionais.map((profissional) => (
                        <SelectItem key={profissional.id} value={profissional.id}>
                          {profissional.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Forma de contato preferida">
              <Controller
                control={control}
                name="formaContatoPreferida"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Forma de contato preferida">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Observações gerais" htmlFor="observacoes" full>
              <Textarea id="observacoes" rows={3} {...register("observacoes")} />
            </FormField>
          </FormSection>

          <FormSection title="Consentimentos" description="Exigidos pela LGPD antes do primeiro atendimento.">
            <div className="col-span-full space-y-3">
              <div className="flex items-start gap-2.5">
                <Controller
                  control={control}
                  name="consentimentoLgpd"
                  render={({ field }) => (
                    <Checkbox
                      id="consentimentoLgpd"
                      className="mt-0.5"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                  )}
                />
                <div>
                  <Label htmlFor="consentimentoLgpd" className="font-normal">
                    O paciente aceitou o termo de tratamento de dados pessoais (LGPD).
                  </Label>
                  {errors.consentimentoLgpd?.message && (
                    <p className="mt-1 text-xs text-destructive">{errors.consentimentoLgpd.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Controller
                  control={control}
                  name="autorizacaoImagem"
                  render={({ field }) => (
                    <Checkbox
                      id="autorizacaoImagem"
                      className="mt-0.5"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                  )}
                />
                <Label htmlFor="autorizacaoImagem" className="font-normal">
                  O paciente autorizou o uso de imagem para fins clínicos e de divulgação.
                </Label>
              </div>
            </div>
          </FormSection>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href={paciente ? `/pacientes/${paciente.id}` : "/pacientes"}>Cancelar</Link>
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {edicao ? "Salvar alterações" : "Cadastrar paciente"}
        </Button>
      </div>
    </form>
  );
}
