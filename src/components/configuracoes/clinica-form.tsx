"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { FormField, FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCep, formatCnpj, formatPhone } from "@/lib/format";
import type { Clinica } from "@/types";

const schema = z.object({
  nomeFantasia: z.string().min(3, "Informe o nome fantasia."),
  razaoSocial: z.string().min(3, "Informe a razão social."),
  cnpj: z.string().min(18, "Informe um CNPJ válido."),
  telefone: z.string().min(14, "Informe um telefone válido."),
  email: z.string().email("E-mail inválido."),
  cep: z.string().min(9, "CEP incompleto."),
  rua: z.string().min(3, "Informe o logradouro."),
  numero: z.string().min(1, "Informe o número."),
  complemento: z.string(),
  bairro: z.string().min(2, "Informe o bairro."),
  cidade: z.string().min(2, "Informe a cidade."),
  uf: z.string().length(2, "UF deve ter 2 letras."),
});

type FormValues = z.infer<typeof schema>;

export function ClinicaForm({ clinica }: { clinica: Clinica }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeFantasia: clinica.nomeFantasia,
      razaoSocial: clinica.razaoSocial,
      cnpj: formatCnpj(clinica.cnpj),
      telefone: formatPhone(clinica.telefone),
      email: clinica.email,
      cep: formatCep(clinica.endereco.cep),
      rua: clinica.endereco.rua,
      numero: clinica.endereco.numero,
      complemento: clinica.endereco.complemento ?? "",
      bairro: clinica.endereco.bairro,
      cidade: clinica.endereco.cidade,
      uf: clinica.endereco.uf,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dados da clínica"
        description="Identidade, endereço e unidades usadas no seletor de contexto."
      />

      <form
        className="space-y-6"
        onSubmit={handleSubmit(async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          toast.success("Dados da clínica salvos");
        })}
      >
        <Card>
          <CardContent className="space-y-6 p-6">
            <FormSection title="Identificação" description="Informações exibidas em documentos e no cabeçalho.">
              <FormField label="Nome fantasia" htmlFor="nomeFantasia" error={errors.nomeFantasia?.message} required>
                <Input id="nomeFantasia" aria-invalid={Boolean(errors.nomeFantasia)} {...register("nomeFantasia")} />
              </FormField>
              <FormField label="Razão social" htmlFor="razaoSocial" error={errors.razaoSocial?.message} required>
                <Input id="razaoSocial" aria-invalid={Boolean(errors.razaoSocial)} {...register("razaoSocial")} />
              </FormField>
              <FormField label="CNPJ" htmlFor="cnpj" error={errors.cnpj?.message} required>
                <Input
                  id="cnpj"
                  aria-invalid={Boolean(errors.cnpj)}
                  {...register("cnpj", {
                    onChange: (event) => setValue("cnpj", formatCnpj(event.target.value)),
                  })}
                />
              </FormField>
              <FormField label="Telefone" htmlFor="telefone" error={errors.telefone?.message} required>
                <Input
                  id="telefone"
                  aria-invalid={Boolean(errors.telefone)}
                  {...register("telefone", {
                    onChange: (event) => setValue("telefone", formatPhone(event.target.value)),
                  })}
                />
              </FormField>
              <FormField label="E-mail" htmlFor="email" error={errors.email?.message} required full>
                <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
              </FormField>
            </FormSection>

            <FormSection title="Endereço" description="Usado em notas, contratos e comprovantes.">
              <FormField label="CEP" htmlFor="cep" error={errors.cep?.message} required>
                <Input
                  id="cep"
                  aria-invalid={Boolean(errors.cep)}
                  {...register("cep", {
                    onChange: (event) => setValue("cep", formatCep(event.target.value)),
                  })}
                />
              </FormField>
              <FormField label="UF" htmlFor="uf" error={errors.uf?.message} required>
                <Input id="uf" maxLength={2} className="uppercase" aria-invalid={Boolean(errors.uf)} {...register("uf")} />
              </FormField>
              <FormField label="Cidade" htmlFor="cidade" error={errors.cidade?.message} required>
                <Input id="cidade" aria-invalid={Boolean(errors.cidade)} {...register("cidade")} />
              </FormField>
              <FormField label="Bairro" htmlFor="bairro" error={errors.bairro?.message} required>
                <Input id="bairro" aria-invalid={Boolean(errors.bairro)} {...register("bairro")} />
              </FormField>
              <FormField label="Logradouro" htmlFor="rua" error={errors.rua?.message} required>
                <Input id="rua" aria-invalid={Boolean(errors.rua)} {...register("rua")} />
              </FormField>
              <FormField label="Número" htmlFor="numero" error={errors.numero?.message} required>
                <Input id="numero" aria-invalid={Boolean(errors.numero)} {...register("numero")} />
              </FormField>
              <FormField label="Complemento" htmlFor="complemento" error={errors.complemento?.message} full>
                <Input id="complemento" {...register("complemento")} />
              </FormField>
            </FormSection>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unidades</CardTitle>
            <CardDescription>Filiais disponíveis no seletor da topbar (multi-unidade).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {clinica.unidades.map((unidade) => (
              <Badge key={unidade.id} tone="primary">
                {unidade.nome} · {unidade.cidade}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
