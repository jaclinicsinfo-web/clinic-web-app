"use client";

import * as React from "react";

import { SeletorPagamento } from "@/components/assinatura/seletor-pagamento";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { descricaoSituacao } from "@/lib/assinatura";
import { obterAssinaturaApi, type AssinaturaClinica } from "@/services/assinatura";

export function AssinaturaView() {
  const [assinatura, setAssinatura] = React.useState<AssinaturaClinica | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

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
  }, []);

  const situacao = assinatura ? descricaoSituacao(assinatura) : null;

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
                  {assinatura.tipoAcesso === "pago" ? ` · ${assinatura.ciclo === "anual" ? "anual" : "mensal"}` : ""}
                </CardTitle>
                <Badge tone={situacao.tom}>{situacao.rotulo}</Badge>
              </div>
              <CardDescription>{situacao.texto}</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagar</CardTitle>
              <CardDescription>
                O pagamento abre no Mercado Pago. Assim que ele confirmar, o novo vencimento aparece aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!assinatura.podePagar ? (
                <p className="text-sm text-muted-foreground">Só o administrador da clínica pode pagar a assinatura.</p>
              ) : !assinatura.pagamentoDisponivel ? (
                <p className="text-sm text-muted-foreground">O pagamento online ainda não está disponível. Fale com o suporte.</p>
              ) : (
                <SeletorPagamento planoInicial={assinatura.plano.codigo} cicloInicial={assinatura.ciclo} />
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
