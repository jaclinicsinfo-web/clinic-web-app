"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-section";
import { redefinirSenhaApi } from "@/services/auth";
import { ApiError } from "@/lib/api";

const schema = z
  .object({
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme a senha."),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

type FormValues = z.infer<typeof schema>;

export function RedefinirSenhaForm({ token }: { token: string }) {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { senha: "", confirmarSenha: "" },
  });

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Link inválido</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Este link de recuperação está incompleto. Solicite um novo e-mail.
        </p>
        <Button asChild className="mt-8 w-full" size="lg">
          <Link href="/esqueci-senha">Pedir novo link</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setErro(null);
    try {
      await redefinirSenhaApi(token, values.senha);
      toast.success("Senha redefinida", { description: "Entre com a nova senha." });
      router.replace("/login");
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível redefinir a senha.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Nova senha</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Escolha uma senha com no mínimo 8 caracteres.</p>

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

        <FormField label="Nova senha" htmlFor="senha" error={errors.senha?.message} required>
          <div className="relative">
            <Input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
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

        <FormField label="Confirmar senha" htmlFor="confirmarSenha" error={errors.confirmarSenha?.message} required>
          <Input
            id="confirmarSenha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmarSenha)}
            {...register("confirmarSenha")}
          />
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Salvar senha
        </Button>
      </form>
    </div>
  );
}
