"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

function RetornoPagamento() {
  const params = useSearchParams();
  const pedido = params.get("pedido") ?? "";
  const resultado = params.get("resultado");
  const [estado, setEstado] = React.useState<"aguardando" | "pago" | "pendente" | "erro">("aguardando");
  const [mensagem, setMensagem] = React.useState("Confirmando o pagamento…");
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    if (!pedido || resultado === "recusado") {
      setEstado(resultado === "recusado" ? "erro" : "pendente");
      setMensagem(resultado === "recusado" ? "O pagamento não foi concluído." : "Não encontramos este pedido.");
      return;
    }

    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    let ativo = true;
    void fetch(`${base}/assinatura/sincronizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId: pedido }),
    })
      .then(async (resposta) => {
        const json = (await resposta.json().catch(() => null)) as {
          message?: string;
          mensagem?: string;
          email?: string;
          status?: string;
        } | null;
        if (!ativo) return;
        if (!resposta.ok) {
          setEstado("erro");
          setMensagem(json?.message || "Não foi possível confirmar o pagamento.");
          return;
        }
        setMensagem(json?.mensagem || "Pagamento recebido.");
        setEmail(json?.email || "");
        setEstado(json?.status === "pago" ? "pago" : "pendente");
      })
      .catch(() => {
        if (!ativo) return;
        setEstado("erro");
        setMensagem("Não foi possível confirmar o pagamento.");
      });

    return () => {
      ativo = false;
    };
  }, [pedido, resultado]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">{mensagem}</h1>
        {email ? <p className="mt-3 text-sm text-muted-foreground">O acesso foi enviado para {email}.</p> : null}
        <div className="mt-6 flex gap-3">
          {estado === "pago" ? (
            <Button asChild>
              <Link href="/login">Ir para o login</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/">Voltar aos planos</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RetornoPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Confirmando o pagamento…</p>}>
      <RetornoPagamento />
    </Suspense>
  );
}
