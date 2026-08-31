"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-section";
import { solicitarRecuperacaoSenha } from "@/services/auth";
import { ApiError } from "@/lib/api";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail.").email("E-mail inválido."),
});

type FormValues = z.infer<typeof schema>;

export function EsqueciSenhaForm() {
  const [enviado, setEnviado] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setErro(null);
    try {
      await solicitarRecuperacaoSenha(values.email);
      setEnviado(true);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível enviar o e-mail. Tente novamente.");
    }
  }

  if (enviado) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Verifique seu e-mail</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Se este e-mail estiver cadastrado, enviaremos um link para redefinir a senha. O link vale por 1 hora.
        </p>
        <Button asChild className="mt-8 w-full" size="lg">
          <Link href="/login">Voltar ao login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao login
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">Esqueci minha senha</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Informe o e-mail da sua conta. Se ele existir no sistema, você receberá um link para criar uma nova senha.
      </p>

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

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Enviar link
        </Button>
      </form>
    </div>
  );
}
