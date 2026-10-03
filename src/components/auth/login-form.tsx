"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField } from "@/components/shared/form-section";
import { autenticar, selecionarUnidade } from "@/services/auth";
import { useSessaoStore } from "@/hooks/use-sessao";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import type { Permissao, PlanoAtual, Unidade, UsoUsuarios, Usuario } from "@/types";

const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail.").email("E-mail inválido."),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  lembrar: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginPendente {
  usuario: Usuario;
  unidades: Unidade[];
  lembrar: boolean;
  plano: PlanoAtual | null;
  usoUsuarios: UsoUsuarios | null;
  permissoes: Permissao[] | null;
  clinicaNome: string | null;
  clinicaId: string | null;
}

export function LoginForm() {
  const router = useRouter();
  const hidratado = useSessaoStore((state) => state.hidratado);
  const sessao = useSessaoStore((state) => state.sessao);
  const iniciarSessao = useSessaoStore((state) => state.iniciarSessao);

  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [erroAuth, setErroAuth] = React.useState<string | null>(null);
  const [pendente, setPendente] = React.useState<LoginPendente | null>(null);
  const [unidadeId, setUnidadeId] = React.useState("");
  const [confirmandoUnidade, setConfirmandoUnidade] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "", lembrar: true },
  });

  React.useEffect(() => {
    if (!hidratado) return;
    if (sessao) {
      router.replace(sessao.primeiroAcesso ? "/primeiro-acesso" : "/dashboard");
    }
  }, [hidratado, sessao, router]);

  function concluir(
    usuario: Usuario,
    unidadeAtualId: string,
    lembrar: boolean,
    unidades: Unidade[],
    plano: PlanoAtual | null,
    usoUsuarios: UsoUsuarios | null,
    permissoes: Permissao[] | null,
    clinicaNome: string | null,
    clinicaId: string | null,
    primeiroAcesso = false,
  ) {
    iniciarSessao(
      usuario,
      unidadeAtualId,
      unidades,
      lembrar,
      plano,
      usoUsuarios,
      permissoes,
      clinicaNome,
      clinicaId,
      primeiroAcesso,
    );
    if (primeiroAcesso) {
      router.push("/primeiro-acesso");
      return;
    }
    toast.success(`Olá, ${usuario.nome.split(" ")[0]}!`, {
      description: `${usuario.perfilNome} · sessão iniciada`,
    });
    router.push("/dashboard");
  }

  async function onSubmit(values: LoginFormValues) {
    setErroAuth(null);
    const resultado = await autenticar(values.email, values.senha, values.lembrar);

    if (!resultado.ok) {
      setErroAuth(resultado.erro);
      return;
    }

    if (resultado.primeiroAcesso) {
      concluir(
        resultado.usuario,
        resultado.unidadeAtualId ?? resultado.unidades[0]?.id ?? "",
        values.lembrar,
        resultado.unidades,
        resultado.plano,
        resultado.usoUsuarios,
        resultado.permissoes,
        resultado.clinicaNome,
        resultado.clinicaId,
        true,
      );
      return;
    }

    if (resultado.unidades.length === 0) {
      setErroAuth("Nenhuma unidade liberada para este usuário. Fale com o administrador.");
      return;
    }

    if (resultado.unidades.length === 1) {
      concluir(
        resultado.usuario,
        resultado.unidades[0].id,
        values.lembrar,
        resultado.unidades,
        resultado.plano,
        resultado.usoUsuarios,
        resultado.permissoes,
        resultado.clinicaNome,
        resultado.clinicaId,
      );
      return;
    }

    setUnidadeId(resultado.unidadeAtualId ?? resultado.unidades[0].id);
    setPendente({
      usuario: resultado.usuario,
      unidades: resultado.unidades,
      lembrar: values.lembrar,
      plano: resultado.plano,
      usoUsuarios: resultado.usoUsuarios,
      permissoes: resultado.permissoes,
      clinicaNome: resultado.clinicaNome,
      clinicaId: resultado.clinicaId,
    });
  }

  async function confirmarUnidade() {
    if (!pendente || !unidadeId) return;
    setConfirmandoUnidade(true);
    setErroAuth(null);

    try {
      await selecionarUnidade(unidadeId, pendente.lembrar);
      concluir(
        pendente.usuario,
        unidadeId,
        pendente.lembrar,
        pendente.unidades,
        pendente.plano,
        pendente.usoUsuarios,
        pendente.permissoes,
        pendente.clinicaNome,
        pendente.clinicaId,
      );
    } catch (error) {
      setConfirmandoUnidade(false);
      setErroAuth(error instanceof ApiError ? error.message : "Não foi possível selecionar a unidade.");
    }
  }

  if (!hidratado || sessao) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  if (pendente) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setPendente(null);
            setErroAuth(null);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">Selecionar unidade</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Olá, {pendente.usuario.nome.split(" ")[0]}. Você tem acesso a mais de uma unidade. Escolha onde deseja
          trabalhar nesta sessão.
        </p>

        {erroAuth && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {erroAuth}
          </p>
        )}

        <RadioGroup value={unidadeId} onValueChange={setUnidadeId} className="mt-8 gap-3">
          {pendente.unidades.map((unidade) => {
            const selecionada = unidade.id === unidadeId;
            return (
              <label
                key={unidade.id}
                htmlFor={`unidade-${unidade.id}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  selecionada ? "border-primary bg-primary-subtle" : "border-border hover:bg-muted",
                )}
              >
                <RadioGroupItem value={unidade.id} id={`unidade-${unidade.id}`} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Building2 className="size-4 text-primary" />
                    {unidade.nome}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{unidade.cidade}</span>
                </span>
              </label>
            );
          })}
        </RadioGroup>

        <Button type="button" className="mt-6 w-full" size="lg" loading={confirmandoUnidade} onClick={confirmarUnidade}>
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Entrar</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Use suas credenciais corporativas para acessar o painel da clínica.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {erroAuth && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {erroAuth}
          </p>
        )}

        <FormField label="E-mail" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="nome@clinica.com.br"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>

        <FormField label="Senha" htmlFor="senha" error={errors.senha?.message} required>
          <div className="relative">
            <Input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              aria-invalid={Boolean(errors.senha)}
              {...register("senha")}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="lembrar"
              checked={watch("lembrar")}
              onCheckedChange={(checked) => setValue("lembrar", Boolean(checked))}
            />
            <Label htmlFor="lembrar" className="font-normal text-muted-foreground">
              Manter conectado
            </Label>
          </div>
          <Link
            href="/esqueci-senha"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        O cadastro de novos usuários é feito pelo administrador da clínica em
        <span className="font-medium text-foreground"> Configurações › Usuários</span>.
      </p>
    </div>
  );
}
