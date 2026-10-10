"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { sincronizarPagamentoApi } from "@/services/assinatura";

type Estado = "aguardando" | "pago" | "pendente" | "erro";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TENTATIVAS = 8;

function RetornoPagamento() {
  const params = useSearchParams();
  const pedido = params.get("pedido") ?? "";
  const resultado = params.get("resultado");
  const sessao = useSessaoStore((state) => state.sessao);
  const [estado, setEstado] = React.useState<Estado>("aguardando");
  const [mensagem, setMensagem] = React.useState("Confirmando o pagamento…");

  const fixo: { estado: Estado; mensagem: string } | null =
    resultado === "recusado"
      ? { estado: "erro", mensagem: "O pagamento não foi concluído. Nada foi cobrado." }
      : !UUID.test(pedido)
        ? { estado: "erro", mensagem: "Não encontramos este pagamento." }
        : null;
  const temFixo = fixo !== null;

  React.useEffect(() => {
    if (temFixo) return;
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // O Pix pode levar alguns segundos para compensar: consulta de novo enquanto estiver pendente.
    const consultar = async (tentativa: number) => {
      try {
        const dados = await sincronizarPagamentoApi(pedido);
        if (!ativo) return;
        setMensagem(dados.mensagem);
        if (dados.status === "pago") {
          setEstado("pago");
          return;
        }
        if (dados.status === "revisao" || dados.status === "estornado") {
          setEstado("erro");
          return;
        }
        setEstado("pendente");
        if (tentativa < TENTATIVAS) timer = setTimeout(() => void consultar(tentativa + 1), 5000);
      } catch (error) {
        if (!ativo) return;
        setEstado("erro");
        setMensagem(error instanceof ApiError ? error.message : "Não foi possível confirmar o pagamento.");
      }
    };
    void consultar(1);
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
    };
  }, [pedido, temFixo]);

  const estadoTela = fixo?.estado ?? estado;
  const mensagemTela = fixo?.mensagem ?? mensagem;
  const destino = sessao ? "/configuracoes/assinatura" : "/login";
  const Icone = estadoTela === "pago" ? CheckCircle2 : estadoTela === "erro" ? XCircle : Clock3;

  return (
    <div>
      <Icone
        className={
          estadoTela === "pago" ? "size-8 text-success" : estadoTela === "erro" ? "size-8 text-danger" : "size-8 text-warning"
        }
        aria-hidden
      />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {estadoTela === "pago" ? "Pagamento confirmado" : estadoTela === "erro" ? "Pagamento não confirmado" : "Aguardando confirmação"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground" aria-live="polite">
        {mensagemTela}
      </p>
      {estadoTela === "pendente" ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Se você pagou com Pix, a confirmação pode levar alguns minutos. Você pode sair desta página: o vencimento é
          atualizado sozinho quando o Mercado Pago avisar.
        </p>
      ) : null}
      <Button asChild className="mt-6 w-full" size="lg" variant={estadoTela === "pago" ? "default" : "outline"}>
        <Link href={destino}>{sessao ? "Voltar ao sistema" : "Entrar no sistema"}</Link>
      </Button>
    </div>
  );
}

export default function RetornoAssinaturaPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Confirmando o pagamento…</p>}>
      <RetornoPagamento />
    </Suspense>
  );
}
