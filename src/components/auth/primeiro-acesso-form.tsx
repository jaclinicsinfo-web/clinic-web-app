"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-section";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { mensagemValidadeTeste } from "@/lib/acesso-gratuito";
import { concluirPrimeiroAcesso } from "@/services/auth";

const schema = z.object({
  unidadeNome: z.string().trim().min(3, "Nome da unidade deve ter no mínimo 3 caracteres."),
  unidadeCidade: z.string().trim().min(2, "Cidade inválida."),
  adminNome: z.string().trim().min(3, "Nome do administrador deve ter no mínimo 3 caracteres."),
});

type FormValues = z.infer<typeof schema>;

export function PrimeiroAcessoForm() {
  const router = useRouter();
  const hidratado = useSessaoStore((state) => state.hidratado);
  const sessao = useSessaoStore((state) => state.sessao);
  const lembrar = useSessaoStore((state) => state.lembrar);
  const iniciarSessao = useSessaoStore((state) => state.iniciarSessao);
  const [erro, setErro] = React.useState<string | null>(null);

  const unidade = sessao?.unidades[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      unidadeNome: unidade?.nome ?? "",
      unidadeCidade: unidade?.cidade ?? "",
      adminNome: sessao?.nome ?? "",
    },
  });

  React.useEffect(() => {
    if (!hidratado) return;
    if (!sessao) {
      router.replace("/login");
      return;
    }
    if (!sessao.primeiroAcesso) {
      router.replace("/dashboard");
    }
  }, [hidratado, sessao, router]);

  async function onSubmit(values: FormValues) {
    setErro(null);
    try {
      const resultado = await concluirPrimeiroAcesso(values, lembrar);
      const unidadeAtualId = resultado.unidadeAtualId ?? resultado.unidades[0]?.id ?? "";
      iniciarSessao(
        resultado.usuario,
        unidadeAtualId,
        resultado.unidades,
        lembrar,
        resultado.plano,
        resultado.usoUsuarios,
        resultado.permissoes,
        resultado.clinicaNome,
        resultado.clinicaId,
        false,
        resultado.isolarDados,
        resultado.acessoGratuito,
      );
      const validade = mensagemValidadeTeste(resultado.acessoGratuito?.expiraEm, resultado.plano?.nome);
      toast.success("Unidade e administrador configurados.", {
        description: validade ?? undefined,
      });
      router.push("/dashboard");
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível salvar. Tente novamente.");
    }
  }

  if (!hidratado || !sessao?.primeiroAcesso) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  const validadeTeste = mensagemValidadeTeste(sessao.acessoGratuito?.expiraEm, sessao.plano?.nome);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Primeiro acesso</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Unidade e administrador</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Confirme quem administra o painel e a unidade de atendimento. A clínica é configurada numa etapa seguinte.
      </p>
      {validadeTeste ? <p className="mt-3 text-xs text-muted-foreground">{validadeTeste}</p> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {erro && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {erro}
          </p>
        )}

        <FormField label="Nome da unidade" htmlFor="unidadeNome" error={errors.unidadeNome?.message} required>
          <Input id="unidadeNome" autoFocus placeholder="Unidade Centro" aria-invalid={Boolean(errors.unidadeNome)} {...register("unidadeNome")} />
        </FormField>

        <FormField label="Cidade" htmlFor="unidadeCidade" error={errors.unidadeCidade?.message} required>
          <Input id="unidadeCidade" placeholder="Ribeirão Preto" aria-invalid={Boolean(errors.unidadeCidade)} {...register("unidadeCidade")} />
        </FormField>

        <FormField label="Nome do administrador" htmlFor="adminNome" error={errors.adminNome?.message} required>
          <Input id="adminNome" autoComplete="name" placeholder="Nome completo" aria-invalid={Boolean(errors.adminNome)} {...register("adminNome")} />
        </FormField>

        <FormField label="E-mail do administrador" htmlFor="adminEmail">
          <Input id="adminEmail" value={sessao.email} readOnly />
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Continuar
        </Button>
      </form>
    </div>
  );
}
