"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-section";
import { useSessaoStore } from "@/hooks/use-sessao";
import { formatCnpj, formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { concluirSetup, consultarSetup } from "@/services/setup";

const setupSchema = z
  .object({
    nomeFantasia: z.string().trim().min(3, "Nome fantasia deve ter no mínimo 3 caracteres."),
    razaoSocial: z.string().trim().min(3, "Razão social deve ter no mínimo 3 caracteres."),
    cnpj: z
      .string()
      .refine((valor) => valor.replace(/\D/g, "").length === 14, "CNPJ deve conter 14 dígitos."),
    telefone: z
      .string()
      .refine(
        (valor) => [10, 11].includes(valor.replace(/\D/g, "").length),
        "Telefone deve conter 10 ou 11 dígitos.",
      ),
    emailClinica: z.string().trim().email("E-mail da clínica inválido."),
    unidadeNome: z.string().trim().min(3, "Nome da unidade deve ter no mínimo 3 caracteres."),
    unidadeCidade: z.string().trim().min(2, "Cidade inválida."),
    adminNome: z.string().trim().min(3, "Nome do administrador deve ter no mínimo 3 caracteres."),
    adminEmail: z.string().trim().email("E-mail do administrador inválido."),
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme a senha."),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    path: ["confirmarSenha"],
    message: "As senhas não coincidem.",
  });

type SetupFormValues = z.infer<typeof setupSchema>;

const CAMPOS_PASSO: Record<1 | 2 | 3, (keyof SetupFormValues)[]> = {
  1: ["nomeFantasia", "razaoSocial", "cnpj", "telefone", "emailClinica"],
  2: ["unidadeNome", "unidadeCidade"],
  3: ["adminNome", "adminEmail", "senha", "confirmarSenha"],
};

const ROTULOS_PASSO = ["Clínica", "Unidade", "Administrador"];

export function SetupForm() {
  const router = useRouter();
  const hidratado = useSessaoStore((state) => state.hidratado);
  const sessao = useSessaoStore((state) => state.sessao);
  const iniciarSessao = useSessaoStore((state) => state.iniciarSessao);

  const [passo, setPasso] = React.useState<1 | 2 | 3>(1);
  const [status, setStatus] = React.useState<"checando" | "pronto" | "redirecionando">("checando");
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [erroSetup, setErroSetup] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      nomeFantasia: "",
      razaoSocial: "",
      cnpj: "",
      telefone: "",
      emailClinica: "",
      unidadeNome: "",
      unidadeCidade: "",
      adminNome: "",
      adminEmail: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  React.useEffect(() => {
    if (!hidratado) return;
    if (sessao) {
      setStatus("redirecionando");
      router.replace("/dashboard");
      return;
    }

    let ativo = true;
    consultarSetup()
      .then((setup) => {
        if (!ativo) return;
        if (!setup.precisaSetup) {
          setStatus("redirecionando");
          router.replace("/login");
          return;
        }
        setStatus("pronto");
      })
      .catch(() => {
        if (!ativo) return;
        setStatus("redirecionando");
        router.replace("/login");
      });

    return () => {
      ativo = false;
    };
  }, [hidratado, sessao, router]);

  async function avancar() {
    const valido = await trigger(CAMPOS_PASSO[passo]);
    if (!valido) return;
    setErroSetup(null);
    setPasso((atual) => (atual === 3 ? 3 : ((atual + 1) as 1 | 2 | 3)));
  }

  async function onSubmit(values: SetupFormValues) {
    setErroSetup(null);
    const resultado = await concluirSetup({
      clinica: {
        nomeFantasia: values.nomeFantasia,
        razaoSocial: values.razaoSocial,
        cnpj: values.cnpj,
        telefone: values.telefone,
        email: values.emailClinica,
      },
      unidade: { nome: values.unidadeNome, cidade: values.unidadeCidade },
      usuario: {
        nome: values.adminNome,
        email: values.adminEmail,
        senha: values.senha,
      },
    });

    if (!resultado.ok) {
      setErroSetup(resultado.erro);
      return;
    }

    const unidadeId = resultado.unidadeAtualId ?? resultado.unidades[0]?.id;
    if (!unidadeId) {
      setErroSetup("A clínica foi criada, mas nenhuma unidade ficou disponível. Entre novamente.");
      return;
    }

    iniciarSessao(
      resultado.usuario,
      unidadeId,
      resultado.unidades,
      true,
      resultado.plano,
      resultado.usoUsuarios,
    );
    toast.success("Clínica configurada", {
      description: `${resultado.usuario.nome.split(" ")[0]}, você é o administrador geral.`,
    });
    router.push("/dashboard");
  }

  if (!hidratado || status !== "pronto") {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-primary">Primeiro acesso</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Configurar a clínica</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Crie a clínica, a primeira unidade e o usuário administrador. Os demais acessos entram depois em
        Configurações › Usuários.
      </p>

      <ol className="mt-6 flex items-center gap-2" aria-label="Etapas do cadastro">
        {ROTULOS_PASSO.map((rotulo, indice) => {
          const numero = (indice + 1) as 1 | 2 | 3;
          const ativo = passo === numero;
          const concluido = passo > numero;
          return (
            <li key={rotulo} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  ativo && "bg-primary text-primary-foreground",
                  concluido && "bg-primary/15 text-primary",
                  !ativo && !concluido && "bg-muted text-muted-foreground",
                )}
              >
                {numero}
              </span>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  ativo ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {rotulo}
              </span>
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(evento) => {
          if (passo < 3) {
            evento.preventDefault();
            void avancar();
            return;
          }
          void handleSubmit(onSubmit)(evento);
        }}
        className="mt-8 space-y-4"
      >
        {erroSetup && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2.5 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {erroSetup}
          </p>
        )}

        {passo === 1 && (
          <>
            <FormField label="Nome fantasia" htmlFor="nomeFantasia" error={errors.nomeFantasia?.message} required>
              <Input
                id="nomeFantasia"
                autoFocus
                placeholder="Clínica Vida Integrada"
                aria-invalid={Boolean(errors.nomeFantasia)}
                {...register("nomeFantasia")}
              />
            </FormField>
            <FormField label="Razão social" htmlFor="razaoSocial" error={errors.razaoSocial?.message} required>
              <Input
                id="razaoSocial"
                placeholder="Clínica Vida Integrada LTDA"
                aria-invalid={Boolean(errors.razaoSocial)}
                {...register("razaoSocial")}
              />
            </FormField>
            <FormField label="CNPJ" htmlFor="cnpj" error={errors.cnpj?.message} required>
              <Input
                id="cnpj"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                aria-invalid={Boolean(errors.cnpj)}
                {...register("cnpj", {
                  onChange: (evento) => setValue("cnpj", formatCnpj(evento.target.value)),
                })}
              />
            </FormField>
            <FormField label="Telefone" htmlFor="telefone" error={errors.telefone?.message} required>
              <Input
                id="telefone"
                inputMode="tel"
                placeholder="(16) 3321-4500"
                aria-invalid={Boolean(errors.telefone)}
                {...register("telefone", {
                  onChange: (evento) => setValue("telefone", formatPhone(evento.target.value)),
                })}
              />
            </FormField>
            <FormField label="E-mail da clínica" htmlFor="emailClinica" error={errors.emailClinica?.message} required>
              <Input
                id="emailClinica"
                type="email"
                autoComplete="organization"
                placeholder="contato@clinica.com.br"
                aria-invalid={Boolean(errors.emailClinica)}
                {...register("emailClinica")}
              />
            </FormField>
          </>
        )}

        {passo === 2 && (
          <>
            <FormField label="Nome da unidade" htmlFor="unidadeNome" error={errors.unidadeNome?.message} required>
              <Input
                id="unidadeNome"
                autoFocus
                placeholder="Unidade Centro"
                aria-invalid={Boolean(errors.unidadeNome)}
                {...register("unidadeNome")}
              />
            </FormField>
            <FormField label="Cidade" htmlFor="unidadeCidade" error={errors.unidadeCidade?.message} required>
              <Input
                id="unidadeCidade"
                placeholder="Ribeirão Preto"
                aria-invalid={Boolean(errors.unidadeCidade)}
                {...register("unidadeCidade")}
              />
            </FormField>
          </>
        )}

        {passo === 3 && (
          <>
            <FormField label="Nome do administrador" htmlFor="adminNome" error={errors.adminNome?.message} required>
              <Input
                id="adminNome"
                autoFocus
                placeholder="Maria Silva"
                aria-invalid={Boolean(errors.adminNome)}
                {...register("adminNome")}
              />
            </FormField>
            <FormField label="E-mail de acesso" htmlFor="adminEmail" error={errors.adminEmail?.message} required>
              <Input
                id="adminEmail"
                type="email"
                autoComplete="email"
                placeholder="admin@clinica.com.br"
                aria-invalid={Boolean(errors.adminEmail)}
                {...register("adminEmail")}
              />
            </FormField>
            <FormField label="Senha" htmlFor="senha" error={errors.senha?.message} required>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                  aria-invalid={Boolean(errors.senha)}
                  {...register("senha")}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((valor) => !valor)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>
            <FormField
              label="Confirmar senha"
              htmlFor="confirmarSenha"
              error={errors.confirmarSenha?.message}
              required
            >
              <Input
                id="confirmarSenha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmarSenha)}
                {...register("confirmarSenha")}
              />
            </FormField>
          </>
        )}

        <div className="flex gap-2 pt-2">
          {passo > 1 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setErroSetup(null);
                setPasso((atual) => (atual - 1) as 1 | 2 | 3);
              }}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          )}
          {passo < 3 ? (
            <Button type="button" className="flex-1" size="lg" onClick={() => void avancar()}>
              Continuar
            </Button>
          ) : (
            <Button type="submit" className="flex-1" size="lg" loading={isSubmitting}>
              Criar clínica e entrar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
