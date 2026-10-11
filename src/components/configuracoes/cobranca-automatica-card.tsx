"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { URL_ASSINATURAS_MERCADO_PAGO, dataCurta, rotuloCiclo } from "@/lib/assinatura";
import { formatCurrency } from "@/lib/format";
import { ativarAutomaticaApi, desativarAutomaticaApi, type AssinaturaClinica } from "@/services/assinatura";

interface CobrancaAutomaticaCardProps {
  assinatura: AssinaturaClinica;
  /** Recarrega a assinatura depois de cancelar ou desativar. */
  onAlterada: () => void;
  /** Leva até o cartão de pagamento avulso. */
  onPagarAgora: () => void;
}

/** status_detail mais comuns do Mercado Pago. Código desconhecido não aparece para a clínica. */
const MOTIVOS_RECUSA: Record<string, string> = {
  cc_rejected_insufficient_amount: "saldo ou limite insuficiente.",
  cc_rejected_bad_filled_card_number: "número do cartão incorreto.",
  cc_rejected_bad_filled_date: "validade do cartão incorreta.",
  cc_rejected_bad_filled_security_code: "código de segurança incorreto.",
  cc_rejected_bad_filled_other: "dados do cartão incorretos.",
  cc_rejected_call_for_authorize: "o banco pede autorização para esta cobrança.",
  cc_rejected_card_disabled: "o cartão está bloqueado ou desativado.",
  cc_rejected_card_expired: "o cartão está vencido.",
  cc_rejected_high_risk: "recusada pela análise de segurança.",
  cc_rejected_max_attempts: "limite de tentativas atingido.",
  cc_rejected_other_reason: "recusada pelo banco.",
};

export function CobrancaAutomaticaCard({ assinatura, onAlterada, onPagarAgora }: CobrancaAutomaticaCardProps) {
  const { automatica, automaticaDisponivel: podeAlterar } = assinatura;
  const [ativando, setAtivando] = React.useState(false);
  const [cancelando, setCancelando] = React.useState(false);
  const [confirmarDesativar, setConfirmarDesativar] = React.useState(false);

  async function ativar() {
    setAtivando(true);
    try {
      const { linkAutorizacao } = await ativarAutomaticaApi();
      // O Mercado Pago volta para esta tela depois de autorizar o cartão.
      window.location.assign(linkAutorizacao);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível ativar a cobrança automática.");
      setAtivando(false);
    }
  }

  async function desativar() {
    try {
      const { mensagem } = await desativarAutomaticaApi();
      toast.success(mensagem);
      setConfirmarDesativar(false);
      onAlterada();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível desativar a cobrança automática.");
    }
  }

  async function cancelarPendente() {
    setCancelando(true);
    try {
      const { mensagem } = await desativarAutomaticaApi();
      toast.success(mensagem);
      onAlterada();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível cancelar.");
    } finally {
      setCancelando(false);
    }
  }

  function trocarCartao() {
    if (automatica?.linkAutorizacao) {
      window.location.assign(automatica.linkAutorizacao);
      return;
    }
    window.open(URL_ASSINATURAS_MERCADO_PAGO, "_blank", "noopener,noreferrer");
  }

  const botaoDesativar = (variant: "outline" | "ghost") => (
    <Button type="button" variant={variant} onClick={() => setConfirmarDesativar(true)}>
      Desativar
    </Button>
  );

  let selo: { tom: "success" | "warning" | "danger" | "neutral"; rotulo: string } | null = null;
  let texto: React.ReactNode;
  let detalhe: string | null = null;
  let acoes: React.ReactNode = null;

  if (!automatica) {
    const emDia = assinatura.situacao === "em_dia";
    texto = "Pague todo mês sem se preocupar. Cobramos no cartão no dia do vencimento.";
    if (!emDia) {
      detalhe =
        assinatura.situacao === "teste"
          ? "Pague o primeiro período e ative em seguida."
          : "Pague o período em aberto e ative em seguida.";
    }
    acoes = (
      <Button type="button" onClick={ativar} loading={ativando} disabled={!emDia}>
        Ativar
        <ExternalLink />
      </Button>
    );
  } else if (automatica.falhou) {
    selo = { tom: "danger", rotulo: "Cobrança recusada" };
    texto = `A cobrança de ${dataCurta(automatica.falhou.em)} não passou. O Mercado Pago tenta de novo nos próximos dias.`;
    const motivo = automatica.falhou.motivo ? MOTIVOS_RECUSA[automatica.falhou.motivo] : null;
    detalhe = motivo ? `Motivo: ${motivo}` : null;
    acoes = (
      <>
        <Button type="button" onClick={onPagarAgora}>
          Pagar agora
        </Button>
        <Button type="button" variant="outline" onClick={trocarCartao}>
          Trocar cartão
          <ExternalLink />
        </Button>
        {botaoDesativar("ghost")}
      </>
    );
  } else if (automatica.status === "pendente") {
    selo = { tom: "warning", rotulo: "Pendente" };
    texto = "Falta autorizar o cartão no Mercado Pago.";
    const link = automatica.linkAutorizacao;
    acoes = (
      <>
        {link ? (
          <Button type="button" onClick={() => window.location.assign(link)}>
            Continuar
            <ExternalLink />
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={cancelarPendente} loading={cancelando}>
          Cancelar
        </Button>
      </>
    );
  } else if (automatica.status === "pausada") {
    selo = { tom: "neutral", rotulo: "Pausada" };
    texto = "A cobrança automática está pausada no Mercado Pago. Nada é cobrado no cartão enquanto ela estiver pausada.";
    acoes = botaoDesativar("outline");
  } else {
    selo = { tom: "success", rotulo: "Ativa" };
    const quando = automatica.proximaCobrancaEm ? ` em ${dataCurta(automatica.proximaCobrancaEm)}` : "";
    const cartao = automatica.cartaoFinal ? ` no cartão final ${automatica.cartaoFinal}` : "";
    texto = `Próxima cobrança: ${formatCurrency(automatica.valor)}${quando}${cartao}.`;
    acoes = botaoDesativar("outline");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Cobrança automática</CardTitle>
          {selo ? <Badge tone={selo.tom}>{selo.rotulo}</Badge> : null}
        </div>
        {automatica ? (
          <CardDescription>
            Plano {automatica.plano.nome} · {rotuloCiclo(automatica.ciclo)} · {formatCurrency(automatica.valor)}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-foreground">{texto}</p>
          {detalhe ? <p className="text-sm text-muted-foreground">{detalhe}</p> : null}
        </div>
        {podeAlterar ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{acoes}</div>
        ) : (
          <p className="text-sm text-muted-foreground">Só o administrador da clínica pode alterar a cobrança automática.</p>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmarDesativar}
        onOpenChange={setConfirmarDesativar}
        title="Desativar a cobrança automática?"
        description="O período já pago continua valendo. Depois dele, o pagamento volta a ser feito por aqui, com Pix ou cartão."
        confirmLabel="Desativar"
        onConfirm={desativar}
      />
    </Card>
  );
}
