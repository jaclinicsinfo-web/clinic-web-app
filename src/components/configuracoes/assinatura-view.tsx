"use client";

import * as React from "react";
import { toast } from "sonner";

import { SeletorPagamento } from "@/components/assinatura/seletor-pagamento";
import { CobrancaAutomaticaCard } from "@/components/configuracoes/cobranca-automatica-card";
import { HistoricoPagamentos } from "@/components/configuracoes/historico-pagamentos";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { dataCurta, descricaoSituacao, rotuloCiclo } from "@/lib/assinatura";
import { cancelarTrocaAgendadaApi, obterAssinaturaApi, type AssinaturaClinica } from "@/services/assinatura";

export function AssinaturaView() {
  const [assinatura, setAssinatura] = React.useState<AssinaturaClinica | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  // Sobe a cada recarga, para o histórico buscar de novo.
  const [atualizacao, setAtualizacao] = React.useState(0);
  const [cancelandoTroca, setCancelandoTroca] = React.useState(false);
  const pagarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let ativo = true;
    obterAssinaturaApi()
      .then((dados) => {
        if (ativo) setAssinatura(dados);
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar a assinatura.");
      });
    return () => {
      ativo = false;
    };
  }, [atualizacao]);

  const recarregar = React.useCallback(() => setAtualizacao((atual) => atual + 1), []);

  async function cancelarTroca() {
    setCancelandoTroca(true);
    try {
      const { mensagem } = await cancelarTrocaAgendadaApi();
      toast.success(mensagem);
      recarregar();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível cancelar a troca.");
    } finally {
      setCancelandoTroca(false);
    }
  }

  function irParaPagamento() {
    pagarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    pagarRef.current?.focus({ preventScroll: true });
  }

  const situacao = assinatura ? descricaoSituacao(assinatura) : null;
  const trocaAgendada = assinatura?.trocaAgendada ?? null;
  const emDia = assinatura?.situacao === "em_dia";
  const mostrarAutomatica = Boolean(assinatura && (assinatura.automaticaDisponivel || assinatura.automatica));

  return (
    <div className="space-y-6">
      <PageHeader title="Assinatura" description="Plano da clínica, vencimento e pagamento pelo Mercado Pago." />

      {erro ? <p className="text-sm text-danger">{erro}</p> : null}
      {!assinatura && !erro ? <p className="text-sm text-muted-foreground">Carregando…</p> : null}

      {assinatura && situacao ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  Plano {assinatura.plano.nome}
                  {assinatura.tipoAcesso === "pago" ? ` · ${rotuloCiclo(assinatura.ciclo)}` : ""}
                </CardTitle>
                <Badge tone={situacao.tom}>{situacao.rotulo}</Badge>
              </div>
              <CardDescription>{situacao.texto}</CardDescription>
            </CardHeader>
            {trocaAgendada ? (
              <CardContent>
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-foreground">
                    Troca agendada para {dataCurta(trocaAgendada.aPartirDe)}: plano {trocaAgendada.plano.nome} (
                    {rotuloCiclo(trocaAgendada.ciclo)}).
                  </p>
                  {assinatura.podePagar ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelarTroca}
                      loading={cancelandoTroca}
                    >
                      Cancelar troca
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            ) : null}
          </Card>

          <div ref={pagarRef} id="pagar" tabIndex={-1} className="scroll-mt-6 focus:outline-none">
            <Card>
              <CardHeader>
                <CardTitle>{emDia ? "Pagar ou trocar de plano" : "Pagar"}</CardTitle>
                <CardDescription>
                  O pagamento abre no Mercado Pago. Assim que ele confirmar, o novo vencimento aparece aqui.
                  {emDia ? " Escolha outro plano ou ciclo para ver quanto muda." : ""}
                </CardDescription>
                {assinatura.automatica?.status === "ativa" ? (
                  <p className="text-sm text-warning">
                    A cobrança automática está ligada: o cartão é cobrado no vencimento. Pague por aqui só se a cobrança
                    no cartão falhou — o Mercado Pago ainda pode tentar o cartão de novo e, se passar, o valor vira mais
                    um período.
                  </p>
                ) : null}
              </CardHeader>
              <CardContent>
                {!assinatura.podePagar ? (
                  <p className="text-sm text-muted-foreground">Só o administrador da clínica pode pagar a assinatura.</p>
                ) : !assinatura.pagamentoDisponivel ? (
                  <p className="text-sm text-muted-foreground">O pagamento online ainda não está disponível. Fale com o suporte.</p>
                ) : (
                  <SeletorPagamento
                    // Recria quando a troca agendada muda: a simulação guardada e a escolha inicial valiam para a situação de antes.
                    key={`${assinatura.plano.codigo}:${assinatura.ciclo}:${trocaAgendada?.plano.codigo ?? ""}:${trocaAgendada?.ciclo ?? ""}`}
                    planoInicial={trocaAgendada?.plano.codigo ?? assinatura.plano.codigo}
                    cicloInicial={trocaAgendada?.ciclo ?? assinatura.ciclo}
                    troca={
                      emDia
                        ? {
                            planoAtual: assinatura.plano.codigo,
                            cicloAtual: assinatura.ciclo,
                            agendada: trocaAgendada,
                            onConcluida: recarregar,
                          }
                        : undefined
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {mostrarAutomatica ? (
            <CobrancaAutomaticaCard assinatura={assinatura} onAlterada={recarregar} onPagarAgora={irParaPagamento} />
          ) : null}

          {assinatura.podePagar ? <HistoricoPagamentos atualizacao={atualizacao} /> : null}
        </>
      ) : null}
    </div>
  );
}
