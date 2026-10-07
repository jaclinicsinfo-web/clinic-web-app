"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reais } from "@/lib/planos-publicos";

interface FormularioAssinaturaProps {
  plano: string;
  nomePlano: string;
  preco: number;
  modo: "gratuito" | "pago";
}

interface Resultado {
  mensagem: string;
  email: string;
  senhaTemporaria?: string;
}

const VAZIO = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  telefone: "",
  emailClinica: "",
  unidadeNome: "Matriz",
  cidade: "",
  adminNome: "",
  adminEmail: "",
};

export function FormularioAssinatura({ plano, nomePlano, preco, modo }: FormularioAssinaturaProps) {
  const router = useRouter();
  const [valores, setValores] = React.useState(VAZIO);
  const [erro, setErro] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const [resultado, setResultado] = React.useState<Resultado | null>(null);
  const pago = modo === "pago";

  function alterar(campo: keyof typeof VAZIO, valor: string) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);

    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const corpo = {
      plano,
      clinica: {
        nomeFantasia: valores.nomeFantasia,
        razaoSocial: valores.razaoSocial,
        cnpj: valores.cnpj,
        telefone: valores.telefone,
        email: valores.emailClinica,
      },
      unidade: { nome: valores.unidadeNome, cidade: valores.cidade },
      usuario: { nome: valores.adminNome, email: valores.adminEmail },
    };

    try {
      const resposta = await fetch(`${base}/assinatura/${pago ? "checkout" : "gratuito"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const json = (await resposta.json().catch(() => null)) as
        | (Resultado & { checkoutUrl?: string; message?: string })
        | null;
      if (!resposta.ok) {
        throw new Error(json?.message || "Não foi possível concluir a assinatura.");
      }
      if (pago && json?.checkoutUrl) {
        if (json.checkoutUrl.startsWith("http")) {
          window.location.assign(json.checkoutUrl);
          return;
        }
        router.push(json.checkoutUrl);
        return;
      }
      setResultado({
        mensagem: json?.mensagem || "Enviamos o acesso para o e-mail do administrador.",
        email: json?.email || valores.adminEmail,
        senhaTemporaria: json?.senhaTemporaria,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível concluir a assinatura.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Acesso</p>
        <h1 className="mt-2 text-2xl font-semibold">{resultado.mensagem}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          O login de administrador foi enviado para {resultado.email}. Use esse e-mail para entrar.
        </p>
        {resultado.senhaTemporaria ? (
          <p className="mt-4 rounded-lg bg-warning-bg px-3 py-2 text-sm text-warning">
            Senha temporária deste ambiente: <span className="font-semibold">{resultado.senhaTemporaria}</span>
          </p>
        ) : null}
        <Button asChild className="mt-6">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-border bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {pago ? "Assinatura" : "Acesso gratuito"}
      </p>
      <h1 className="mt-2 text-2xl font-semibold">
        {nomePlano}
        <span className="ml-2 text-base font-normal text-muted-foreground">{reais(preco)}/mês</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {pago
          ? "Depois do pagamento, o acesso chega no e-mail do administrador."
          : "São 7 dias no plano escolhido. A senha temporária chega no e-mail do administrador."}
      </p>

      {erro ? (
        <p role="alert" className="mt-4 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2 text-sm text-danger">
          {erro}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Nome fantasia" valor={valores.nomeFantasia} onChange={(valor) => alterar("nomeFantasia", valor)} />
        <Campo rotulo="Razão social" valor={valores.razaoSocial} onChange={(valor) => alterar("razaoSocial", valor)} />
        <Campo rotulo="CNPJ" valor={valores.cnpj} onChange={(valor) => alterar("cnpj", valor)} />
        <Campo rotulo="Telefone" valor={valores.telefone} onChange={(valor) => alterar("telefone", valor)} />
        <Campo rotulo="E-mail da clínica" tipo="email" valor={valores.emailClinica} onChange={(valor) => alterar("emailClinica", valor)} />
        <Campo rotulo="Cidade da unidade" valor={valores.cidade} onChange={(valor) => alterar("cidade", valor)} />
        <Campo rotulo="Nome da unidade" valor={valores.unidadeNome} onChange={(valor) => alterar("unidadeNome", valor)} />
        <Campo rotulo="Nome do administrador" valor={valores.adminNome} onChange={(valor) => alterar("adminNome", valor)} />
        <div className="sm:col-span-2">
          <Campo
            rotulo="E-mail do administrador"
            tipo="email"
            valor={valores.adminEmail}
            onChange={(valor) => alterar("adminEmail", valor)}
          />
          <p className="mt-1 text-xs text-muted-foreground">O acesso é enviado para este e-mail.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" loading={enviando}>
          {pago ? "Ir para o pagamento" : "Começar 7 dias grátis"}
        </Button>
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Trocar plano
        </Link>
      </div>
    </form>
  );
}

function Campo({
  rotulo,
  valor,
  onChange,
  tipo = "text",
}: {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: string;
}) {
  const id = rotulo.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="font-medium">{rotulo}</span>
      <Input id={id} required type={tipo} value={valor} onChange={(evento) => onChange(evento.target.value)} className="mt-1" />
    </label>
  );
}
