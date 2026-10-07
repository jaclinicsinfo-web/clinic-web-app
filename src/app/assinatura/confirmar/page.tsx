"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

function ConfirmarPagamento() {
  const params = useSearchParams();
  const pedido = params.get("pedido") ?? "";
  const [erro, setErro] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const [pronto, setPronto] = React.useState<{ mensagem: string; email: string; senhaTemporaria?: string } | null>(null);

  async function confirmar() {
    setErro("");
    setEnviando(true);
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    try {
      const resposta = await fetch(`${base}/assinatura/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: pedido }),
      });
      const json = (await resposta.json().catch(() => null)) as {
        message?: string;
        mensagem?: string;
        email?: string;
        senhaTemporaria?: string;
      } | null;
      if (!resposta.ok) throw new Error(json?.message || "Não foi possível confirmar o pagamento.");
      setPronto({
        mensagem: json?.mensagem || "Pagamento confirmado.",
        email: json?.email || "",
        senhaTemporaria: json?.senhaTemporaria,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível confirmar o pagamento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-6">
        {pronto ? (
          <>
            <h1 className="text-2xl font-semibold">{pronto.mensagem}</h1>
            {pronto.email ? (
              <p className="mt-3 text-sm text-muted-foreground">Enviado para {pronto.email}.</p>
            ) : null}
            {pronto.senhaTemporaria ? (
              <p className="mt-4 rounded-lg bg-warning-bg px-3 py-2 text-sm text-warning">
                Senha temporária deste ambiente: <span className="font-semibold">{pronto.senhaTemporaria}</span>
              </p>
            ) : null}
            <Button asChild className="mt-6">
              <Link href="/login">Ir para o login</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pagamento local</p>
            <h1 className="mt-2 text-2xl font-semibold">Confirmar a assinatura</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Este passo existe só no ambiente de desenvolvimento, enquanto o Mercado Pago não está configurado. Ao confirmar, a clínica é aberta como paga e o acesso segue por e-mail.
            </p>
            {erro ? <p className="mt-4 text-sm text-danger">{erro}</p> : null}
            <Button type="button" className="mt-6" size="lg" loading={enviando} disabled={!pedido} onClick={confirmar}>
              Confirmar pagamento
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmarPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-muted-foreground">Carregando…</p>}>
      <ConfirmarPagamento />
    </Suspense>
  );
}
