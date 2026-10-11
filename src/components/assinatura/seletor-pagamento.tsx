"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  iniciarPagamentoApi,
  listarPlanosComPrecoApi,
  simularTrocaApi,
  trocarPlanoApi,
  type CicloCobranca,
  type PlanoComPreco,
  type SimulacaoTroca,
  type TrocaAgendada,
} from "@/services/assinatura";
import type { CodigoPlano } from "@/types";

interface SeletorPagamentoProps {
  planoInicial?: CodigoPlano | null;
  cicloInicial?: CicloCobranca | null;
  /** Login bloqueado: o pagamento usa o token curto em vez da sessão. */
  tokenPagamento?: string;
  rotuloBotao?: string;
  /**
   * Clínica em dia: escolher plano ou ciclo diferente do atual vira troca de plano
   * (proporcional, sem custo ou agendada), simulada antes de confirmar.
   * Sem esta prop, sempre paga o período cheio.
   */
  troca?: {
    planoAtual: CodigoPlano;
    cicloAtual: CicloCobranca;
    agendada: TrocaAgendada | null;
    /** Chamado quando a troca é aplicada ou agendada sem passar pelo Mercado Pago. */
    onConcluida: () => void;
  };
}

/** Resultado da última simulação, preso à escolha (plano:ciclo) que o gerou. */
interface ResultadoSimulacao {
  chave: string;
  dados: SimulacaoTroca | null;
  erro: string | null;
}

function rotuloBotaoTroca(simulacao: SimulacaoTroca) {
  if (simulacao.tipo === "downgrade_agendado") return "Agendar troca";
  if (simulacao.valor > 0) return `Pagar ${formatCurrency(simulacao.valor)} no Mercado Pago`;
  return "Trocar agora";
}

const CICLOS: { valor: CicloCobranca; rotulo: string; detalhe: string }[] = [
  { valor: "mensal", rotulo: "Mensal", detalhe: "Pix ou cartão à vista, pago todo mês." },
  { valor: "anual", rotulo: "Anual", detalhe: "Pix à vista ou cartão em até 12x." },
];

export function SeletorPagamento({
  planoInicial,
  cicloInicial,
  tokenPagamento,
  rotuloBotao,
  troca,
}: SeletorPagamentoProps) {
  const [planos, setPlanos] = React.useState<PlanoComPreco[] | null>(null);
  const [plano, setPlano] = React.useState<CodigoPlano | null>(planoInicial ?? null);
  const [ciclo, setCiclo] = React.useState<CicloCobranca>(cicloInicial ?? "mensal");
  const [erro, setErro] = React.useState<string | null>(null);
  const [abrindo, setAbrindo] = React.useState(false);
  const [simulacao, setSimulacao] = React.useState<ResultadoSimulacao | null>(null);

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

  // Mesmo plano e ciclo: paga o período cheio, como sempre. Diferente: é troca.
  const ehTroca = Boolean(
    troca && escolhido && (escolhido.codigo !== troca.planoAtual || cicloEfetivo !== troca.cicloAtual),
  );
  // Com troca agendada, renovar no plano atual cancela o agendamento (o servidor limpa ao confirmar).
  const agendadaCancelada = !ehTroca && troca?.agendada ? troca.agendada : null;
  const chaveTroca = ehTroca && escolhido ? `${escolhido.codigo}:${cicloEfetivo}` : null;
  const simulacaoAtual = simulacao && simulacao.chave === chaveTroca ? simulacao : null;

  React.useEffect(() => {
    if (!chaveTroca) return;
    const [codigo, cicloTroca] = chaveTroca.split(":") as [CodigoPlano, CicloCobranca];
    let ativo = true;
    // Espera a escolha assentar antes de consultar.
    const timer = setTimeout(() => {
      simularTrocaApi(codigo, cicloTroca)
        .then((dados) => {
          if (ativo) setSimulacao({ chave: chaveTroca, dados, erro: null });
        })
        .catch((error) => {
          if (!ativo) return;
          const mensagem = error instanceof ApiError ? error.message : "Não foi possível calcular a troca.";
          setSimulacao({ chave: chaveTroca, dados: null, erro: mensagem });
        });
    }, 300);
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [chaveTroca]);

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

  async function trocar() {
    if (!escolhido || !troca) return;
    setErro(null);
    setAbrindo(true);
    try {
      const resultado = await trocarPlanoApi(escolhido.codigo, cicloEfetivo);
      if (resultado.acao === "checkout") {
        window.location.assign(resultado.checkoutUrl);
        return;
      }
      const aviso = resultado.acao === "agendada" ? resultado.avisoLimite : null;
      toast.success(resultado.mensagem, aviso ? { description: aviso } : undefined);
      setAbrindo(false);
      troca.onConcluida();
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível trocar o plano.");
      setAbrindo(false);
    }
  }

  function renderTroca() {
    const dados = simulacaoAtual?.dados ?? null;
    return (
      <div className="space-y-3">
        {simulacaoAtual?.erro ? (
          <p role="alert" className="text-sm text-danger">
            {simulacaoAtual.erro}
          </p>
        ) : !dados ? (
          <p className="text-sm text-muted-foreground">Calculando a troca…</p>
        ) : (
          <>
            <p className="text-sm text-foreground">{dados.mensagem}</p>
            {[dados.avisoLimite, dados.bloqueio].map((aviso) =>
              aviso ? (
                <p
                  key={aviso}
                  className="flex items-start gap-2 rounded-lg border border-warning-bg bg-warning-bg px-3 py-2.5 text-sm text-warning"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {aviso}
                </p>
              ) : null,
            )}
          </>
        )}
        <div className="flex sm:justify-end">
          <Button
            type="button"
            onClick={trocar}
            loading={abrindo}
            disabled={!dados || Boolean(dados.bloqueio)}
            className="w-full sm:w-auto"
          >
            {dados ? rotuloBotaoTroca(dados) : "Trocar plano"}
            {dados && dados.valor > 0 && dados.tipo !== "downgrade_agendado" ? <ExternalLink /> : null}
          </Button>
        </div>
      </div>
    );
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

          {ehTroca ? (
            renderTroca()
          ) : (
            <div className="space-y-3">
              {agendadaCancelada ? (
                <p className="text-sm text-muted-foreground">
                  Pagar a renovação no plano atual cancela a troca agendada para o plano {agendadaCancelada.plano.nome}.
                </p>
              ) : null}
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
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
