"use client";

import * as React from "react";
import { AlertCircle, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  iniciarPagamentoApi,
  listarPlanosComPrecoApi,
  type CicloCobranca,
  type PlanoComPreco,
} from "@/services/assinatura";
import type { CodigoPlano } from "@/types";

interface SeletorPagamentoProps {
  planoInicial?: CodigoPlano | null;
  cicloInicial?: CicloCobranca | null;
  /** Login bloqueado: o pagamento usa o token curto em vez da sessão. */
  tokenPagamento?: string;
  rotuloBotao?: string;
}

const CICLOS: { valor: CicloCobranca; rotulo: string; detalhe: string }[] = [
  { valor: "mensal", rotulo: "Mensal", detalhe: "Pix ou cartão à vista, pago todo mês." },
  { valor: "anual", rotulo: "Anual", detalhe: "Pix à vista ou cartão em até 12x." },
];

export function SeletorPagamento({ planoInicial, cicloInicial, tokenPagamento, rotuloBotao }: SeletorPagamentoProps) {
  const [planos, setPlanos] = React.useState<PlanoComPreco[] | null>(null);
  const [plano, setPlano] = React.useState<CodigoPlano | null>(planoInicial ?? null);
  const [ciclo, setCiclo] = React.useState<CicloCobranca>(cicloInicial ?? "mensal");
  const [erro, setErro] = React.useState<string | null>(null);
  const [abrindo, setAbrindo] = React.useState(false);

  React.useEffect(() => {
    let ativo = true;
    listarPlanosComPrecoApi()
      .then((lista) => {
        if (!ativo) return;
        setPlanos(lista);
        setPlano((atual) => (atual && lista.some((item) => item.codigo === atual) ? atual : lista[0]?.codigo ?? null));
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar os planos. Atualize a página.");
      });
    return () => {
      ativo = false;
    };
  }, []);

  const escolhido = planos?.find((item) => item.codigo === plano) ?? null;
  const anualDisponivel = Boolean(escolhido && escolhido.precoAnual > 0);
  const cicloEfetivo: CicloCobranca = ciclo === "anual" && !anualDisponivel ? "mensal" : ciclo;
  const preco = escolhido ? (cicloEfetivo === "anual" ? escolhido.precoAnual : escolhido.precoMensal) : 0;

  async function pagar() {
    if (!escolhido) return;
    setErro(null);
    setAbrindo(true);
    try {
      const { checkoutUrl } = await iniciarPagamentoApi(escolhido.codigo, cicloEfetivo, tokenPagamento);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível abrir o pagamento.");
      setAbrindo(false);
    }
  }

  if (!planos && !erro) {
    return <p className="text-sm text-muted-foreground">Carregando planos…</p>;
  }

  return (
    <div className="space-y-5">
      {erro ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger-bg bg-danger-bg px-3 py-2.5 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {erro}
        </p>
      ) : null}

      {planos ? (
        <>
          <fieldset>
            <legend className="text-sm font-medium text-foreground">Plano</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {planos.map((item) => {
                const ativo = item.codigo === plano;
                return (
                  <label
                    key={item.codigo}
                    className={cn(
                      "flex cursor-pointer flex-col rounded-xl border p-3 transition-colors",
                      ativo ? "border-primary bg-primary-subtle" : "border-border hover:bg-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="plano"
                      value={item.codigo}
                      checked={ativo}
                      onChange={() => setPlano(item.codigo)}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold text-foreground">{item.nome}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {formatCurrency(item.precoMensal)}/mês
                      {item.limiteUsuarios ? ` · até ${item.limiteUsuarios} usuários` : " · usuários ilimitados"}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Forma de cobrança</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {CICLOS.map((item) => {
                const desabilitado = item.valor === "anual" && !anualDisponivel;
                const ativo = item.valor === cicloEfetivo;
                const valor = escolhido
                  ? item.valor === "anual"
                    ? `${formatCurrency(escolhido.precoAnual)} por ano`
                    : `${formatCurrency(escolhido.precoMensal)} por mês`
                  : "";
                return (
                  <label
                    key={item.valor}
                    className={cn(
                      "flex flex-col rounded-xl border p-3 transition-colors",
                      desabilitado ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                      ativo ? "border-primary bg-primary-subtle" : "border-border hover:bg-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="ciclo"
                      value={item.valor}
                      checked={ativo}
                      disabled={desabilitado}
                      onChange={() => setCiclo(item.valor)}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {item.rotulo}
                      {valor ? <span className="ml-1.5 font-normal text-muted-foreground">· {valor}</span> : null}
                    </span>
                    <span className="mt-0.5 text-xs text-muted-foreground">{item.detalhe}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Total agora:{" "}
              <span className="font-semibold text-foreground">{escolhido ? formatCurrency(preco) : "—"}</span>
            </p>
            <Button type="button" onClick={pagar} loading={abrindo} disabled={!escolhido}>
              {rotuloBotao ?? "Pagar no Mercado Pago"}
              <ExternalLink />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
