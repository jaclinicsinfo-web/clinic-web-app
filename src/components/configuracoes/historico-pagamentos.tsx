"use client";

import * as React from "react";
import { Printer, Receipt } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { dataCurta, rotuloMeio } from "@/lib/assinatura";
import { formatCurrency } from "@/lib/format";
import { listarPagamentosApi, obterReciboApi, type PagamentoAssinatura } from "@/services/assinatura";

interface HistoricoPagamentosProps {
  /** Muda quando a assinatura é recarregada, para buscar a lista de novo. */
  atualizacao?: number;
}

/**
 * Abre o recibo numa aba nova e chama a impressão.
 * A aba é aberta já no clique (senão o navegador bloqueia) e recebe o HTML depois,
 * porque o recibo exige o token da sessão.
 */
async function abrirRecibo(pagamento: PagamentoAssinatura) {
  const aba = window.open("", "_blank");
  if (!aba) {
    toast.error("O navegador bloqueou a nova aba. Permita pop-ups para abrir o recibo.");
    return;
  }
  aba.document.title = "Recibo";
  aba.document.body.textContent = "Carregando o recibo…";

  let html: string;
  try {
    html = await obterReciboApi(pagamento.id);
  } catch (error) {
    aba.close();
    toast.error(error instanceof ApiError ? error.message : "Não foi possível abrir o recibo.");
    return;
  }
  if (aba.closed) return;

  let impresso = false;
  const imprimir = () => {
    if (impresso || aba.closed) return;
    impresso = true;
    aba.focus();
    aba.print();
  };
  aba.document.open();
  aba.document.write(html);
  aba.document.close();
  // Espera imagens e fontes do recibo; o tempo limite cobre navegadores que não disparam o load.
  if (aba.document.readyState === "complete") {
    imprimir();
  } else {
    aba.addEventListener("load", imprimir, { once: true });
    setTimeout(imprimir, 2000);
  }
}

export function HistoricoPagamentos({ atualizacao }: HistoricoPagamentosProps) {
  const [pagamentos, setPagamentos] = React.useState<PagamentoAssinatura[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [abrindo, setAbrindo] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;
    listarPagamentosApi()
      .then((lista) => {
        if (!ativo) return;
        setPagamentos(lista);
        setErro(null);
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os pagamentos.");
      });
    return () => {
      ativo = false;
    };
  }, [atualizacao]);

  async function recibo(pagamento: PagamentoAssinatura) {
    setAbrindo(pagamento.id);
    try {
      await abrirRecibo(pagamento);
    } finally {
      setAbrindo(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de pagamentos</CardTitle>
        <CardDescription>Pagamentos confirmados e devolvidos. O recibo não substitui a nota fiscal.</CardDescription>
      </CardHeader>
      <CardContent className={pagamentos && pagamentos.length > 0 ? "px-0 pb-0" : undefined}>
        {erro && !pagamentos ? (
          <p className="text-sm text-danger">{erro}</p>
        ) : !pagamentos ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : pagamentos.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Os pagamentos feitos pelo Mercado Pago aparecem aqui."
            className="py-8"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Meio</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Recibo</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.map((pagamento) => {
                const comJuros = pagamento.totalPago !== null && pagamento.totalPago !== pagamento.valor;
                return (
                  <TableRow key={pagamento.id}>
                    <TableCell className="whitespace-nowrap tabular-nums">{dataCurta(pagamento.data)}</TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{pagamento.descricao}</span>
                      {pagamento.periodoInicio && pagamento.periodoFim ? (
                        <span className="block text-xs text-muted-foreground">
                          {dataCurta(pagamento.periodoInicio)} a {dataCurta(pagamento.periodoFim)}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{rotuloMeio(pagamento)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatCurrency(pagamento.valor)}
                      {comJuros ? (
                        <span className="block text-xs text-muted-foreground">
                          {formatCurrency(pagamento.totalPago ?? 0)} com juros
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {pagamento.status === "estornado" ? (
                        <Badge tone="neutral">
                          {pagamento.estornadoEm ? `Devolvido em ${dataCurta(pagamento.estornadoEm)}` : "Devolvido"}
                        </Badge>
                      ) : (
                        <Badge tone="success">Pago</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {pagamento.numeroRecibo !== null ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void recibo(pagamento)}
                          loading={abrindo === pagamento.id}
                          aria-label={`Recibo nº ${pagamento.numeroRecibo}`}
                        >
                          {abrindo === pagamento.id ? null : <Printer />}
                          Recibo
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
