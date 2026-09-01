"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormField, FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { UnidadesClinica } from "@/components/configuracoes/unidades-clinica";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { formatCep, formatCnpj, formatPhone, getInitials } from "@/lib/format";
import { cnpjValido, telefoneValido } from "@/lib/validacao";
import {
  baixarLogoClinicaApi,
  enviarLogoClinicaApi,
  removerLogoClinicaApi,
  salvarClinicaApi,
  type UnidadeMutacao,
} from "@/services/configuracoes";
import type { Clinica, Unidade } from "@/types";

const schema = z.object({
  nomeFantasia: z.string().min(3, "Informe o nome fantasia."),
  razaoSocial: z.string().min(3, "Informe a razão social."),
  cnpj: z.string().refine(cnpjValido, "CNPJ inválido."),
  telefone: z.string().refine(telefoneValido, "Telefone inválido."),
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

function valoresDoForm(clinica: Clinica): FormValues {
  return {
    nomeFantasia: clinica.nomeFantasia,
    razaoSocial: clinica.razaoSocial,
    cnpj: formatCnpj(clinica.cnpj),
    telefone: formatPhone(clinica.telefone),
    email: clinica.email,
    cep: clinica.endereco.cep ? formatCep(clinica.endereco.cep) : "",
    rua: clinica.endereco.rua,
    numero: clinica.endereco.numero,
    complemento: clinica.endereco.complemento ?? "",
    bairro: clinica.endereco.bairro,
    cidade: clinica.endereco.cidade,
    uf: clinica.endereco.uf,
  };
}

export function ClinicaForm({
  clinica,
  podeEditar,
  podeCriar,
  onAtualizada,
  onUnidades,
}: {
  clinica: Clinica;
  podeEditar: boolean;
  podeCriar: boolean;
  onAtualizada: (clinica: Clinica) => void;
  onUnidades: (resultado: UnidadeMutacao, unidades: Unidade[]) => void | Promise<void>;
}) {
  const inputLogo = React.useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [logoTick, setLogoTick] = React.useState(0);
  const [enviandoLogo, setEnviandoLogo] = React.useState(false);
  const [buscandoCep, setBuscandoCep] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresDoForm(clinica),
  });

  React.useEffect(() => {
    reset(valoresDoForm(clinica));
  }, [clinica, reset]);

  React.useEffect(() => {
    if (!clinica.temLogo) {
      setLogoUrl(null);
      return;
    }

    let ativo = true;
    let objectUrl: string | null = null;
    baixarLogoClinicaApi()
      .then((blob) => {
        if (!ativo) return;
        objectUrl = URL.createObjectURL(blob);
        setLogoUrl(objectUrl);
      })
      .catch(() => {
        if (ativo) setLogoUrl(null);
      });

    return () => {
      ativo = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [clinica.temLogo, clinica.id, logoTick]);

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
      setValue("rua", dados.logradouro ?? "");
      setValue("bairro", dados.bairro ?? "");
      setValue("cidade", dados.localidade ?? "");
      setValue("uf", dados.uf ?? "");
    } catch {
      toast.error("Não foi possível consultar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const atualizada = await salvarClinicaApi({
        nomeFantasia: values.nomeFantasia,
        razaoSocial: values.razaoSocial,
        cnpj: values.cnpj,
        telefone: values.telefone,
        email: values.email,
        endereco: {
          cep: values.cep,
          rua: values.rua,
          numero: values.numero,
          complemento: values.complemento || undefined,
          bairro: values.bairro,
          cidade: values.cidade,
          uf: values.uf,
        },
      });
      onAtualizada({ ...atualizada, unidades: clinica.unidades });
      toast.success("Dados da clínica salvos");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar os dados da clínica.");
    }
  }

  async function enviarLogo(arquivo: File) {
    setEnviandoLogo(true);
    try {
      const atualizada = await enviarLogoClinicaApi(arquivo);
      onAtualizada({ ...atualizada, unidades: clinica.unidades });
      setLogoTick((tick) => tick + 1);
      toast.success("Logo atualizada");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível enviar a logo.");
    } finally {
      setEnviandoLogo(false);
      if (inputLogo.current) inputLogo.current.value = "";
    }
  }

  async function removerLogo() {
    setEnviandoLogo(true);
    try {
      const atualizada = await removerLogoClinicaApi();
      onAtualizada({ ...atualizada, unidades: clinica.unidades });
      setLogoTick((tick) => tick + 1);
      toast.success("Logo removida");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível remover a logo.");
    } finally {
      setEnviandoLogo(false);
    }
  }

  const somenteLeitura = !podeEditar;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dados da clínica"
        description="Identidade, endereço e unidades usadas no seletor de contexto."
      />

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Aparece no painel e pode ser usada em documentos da clínica.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Avatar className="size-16 rounded-xl">
              {logoUrl && <AvatarImage src={logoUrl} alt={`Logo de ${clinica.nomeFantasia}`} />}
              <AvatarFallback className="rounded-xl text-base">{getInitials(clinica.nomeFantasia)}</AvatarFallback>
            </Avatar>
            {podeEditar && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={inputLogo}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const arquivo = event.target.files?.[0];
                    if (arquivo) void enviarLogo(arquivo);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  loading={enviandoLogo}
                  onClick={() => inputLogo.current?.click()}
                >
                  <ImagePlus />
                  {clinica.temLogo ? "Trocar logo" : "Enviar logo"}
                </Button>
                {clinica.temLogo && (
                  <Button type="button" variant="ghost" disabled={enviandoLogo} onClick={() => void removerLogo()}>
                    <Trash2 />
                    Remover
                  </Button>
                )}
                <p className="basis-full text-xs text-muted-foreground">JPG, PNG ou WebP de até 2 MB.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-6 p-6">
            <FormSection title="Identificação" description="Informações exibidas em documentos e no cabeçalho.">
              <FormField label="Nome fantasia" htmlFor="nomeFantasia" error={errors.nomeFantasia?.message} required>
                <Input
                  id="nomeFantasia"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.nomeFantasia)}
                  {...register("nomeFantasia")}
                />
              </FormField>
              <FormField label="Razão social" htmlFor="razaoSocial" error={errors.razaoSocial?.message} required>
                <Input
                  id="razaoSocial"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.razaoSocial)}
                  {...register("razaoSocial")}
                />
              </FormField>
              <FormField label="CNPJ" htmlFor="cnpj" error={errors.cnpj?.message} required>
                <Input
                  id="cnpj"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.cnpj)}
                  {...register("cnpj", {
                    onChange: (event) => setValue("cnpj", formatCnpj(event.target.value)),
                  })}
                />
              </FormField>
              <FormField label="Telefone" htmlFor="telefone" error={errors.telefone?.message} required>
                <Input
                  id="telefone"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.telefone)}
                  {...register("telefone", {
                    onChange: (event) => setValue("telefone", formatPhone(event.target.value)),
                  })}
                />
              </FormField>
              <FormField label="E-mail" htmlFor="email" error={errors.email?.message} required full>
                <Input
                  id="email"
                  type="email"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
              </FormField>
            </FormSection>

            <FormSection title="Endereço" description="Usado em notas, contratos e comprovantes.">
              <FormField
                label="CEP"
                htmlFor="cep"
                error={errors.cep?.message}
                hint={buscandoCep ? "Consultando CEP…" : undefined}
                required
              >
                <Input
                  id="cep"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.cep)}
                  {...register("cep", {
                    onChange: (event) => setValue("cep", formatCep(event.target.value)),
                    onBlur: (event) => void buscarCep(event.target.value),
                  })}
                />
              </FormField>
              <FormField label="UF" htmlFor="uf" error={errors.uf?.message} required>
                <Input
                  id="uf"
                  maxLength={2}
                  className="uppercase"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.uf)}
                  {...register("uf")}
                />
              </FormField>
              <FormField label="Cidade" htmlFor="cidade" error={errors.cidade?.message} required>
                <Input
                  id="cidade"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.cidade)}
                  {...register("cidade")}
                />
              </FormField>
              <FormField label="Bairro" htmlFor="bairro" error={errors.bairro?.message} required>
                <Input
                  id="bairro"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.bairro)}
                  {...register("bairro")}
                />
              </FormField>
              <FormField label="Logradouro" htmlFor="rua" error={errors.rua?.message} required>
                <Input id="rua" disabled={somenteLeitura} aria-invalid={Boolean(errors.rua)} {...register("rua")} />
              </FormField>
              <FormField label="Número" htmlFor="numero" error={errors.numero?.message} required>
                <Input
                  id="numero"
                  disabled={somenteLeitura}
                  aria-invalid={Boolean(errors.numero)}
                  {...register("numero")}
                />
              </FormField>
              <FormField label="Complemento" htmlFor="complemento" error={errors.complemento?.message} full>
                <Input id="complemento" disabled={somenteLeitura} {...register("complemento")} />
              </FormField>
            </FormSection>
          </CardContent>
        </Card>

        {podeEditar && (
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              Salvar alterações
            </Button>
          </div>
        )}
      </form>

      <UnidadesClinica
        unidades={clinica.unidades}
        podeCriar={podeCriar}
        podeEditar={podeEditar}
        onMutacao={onUnidades}
      />
    </div>
  );
}
