"use client";

import * as React from "react";
import { AlertCircle, CalendarClock, CircleDollarSign, Landmark } from "lucide-react";
import { toast } from "sonner";

import { ContasAPagarTable } from "@/components/financeiro/contas-a-pagar-table";
import { NovaDespesaDialog } from "@/components/financeiro/nova-despesa-dialog";
import { Pode } from "@/components/auth/pode";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/status";
import { listarDespesasApi, pagarDespesaApi, type ResumoContasAPagar } from "@/services/financeiro";
import type { Despesa } from "@/types";
import type { PagamentoRegistrado } from "@/components/financeiro/registrar-pagamento-dialog";

const resumoVazio: ResumoContasAPagar = {
  totalAPagar: 0,
  totalVencido: 0,
  pagoNoMes: 0,
  vencendo7Dias: 0,
  quantidadeVencida: 0,
  quantidadeAPagar: 0,
  quantidadeVencendo7Dias: 0,
};

export function ContasAPagarWorkspace() {
  const [despesas, setDespesas] = React.useState<Despesa[]>([]);
  const [resumo, setResumo] = React.useState(resumoVazio);
  const [categorias, setCategorias] = React.useState<string[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarDespesasApi();
      setDespesas(data.despesas);
      setResumo(data.resumo);
      setCategorias(data.categorias);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as despesas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function pagar(despesa: Despesa, pagamento: PagamentoRegistrado) {
    try {
      await pagarDespesaApi(despesa.id, {
        valor: pagamento.valor,
        formaPagamento: pagamento.formaPagamento,
        data: pagamento.data,
        observacoes: pagamento.observacoes,
      });
      toast.success("Despesa baixada", {
        description: `${despesa.descricao} · ${formatCurrency(pagamento.valor)} em ${formaPagamentoLabels[pagamento.formaPagamento]}`,
      });
      await carregar();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível dar baixa na despesa.");
    }
  }

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas a pagar"
        description="Despesas operacionais, fornecedores e recorrências."
        actions={
          <Pode modulo="financeiro" acao="criar">
            <NovaDespesaDialog categorias={categorias} onCriada={() => void carregar()} />
          </Pode>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="A pagar" value={carregando ? "—" : formatCurrency(resumo.totalAPagar)} icon={Landmark} />
        <StatCard
          label="Vencidas"
          value={carregando ? "—" : formatCurrency(resumo.totalVencido)}
          icon={AlertCircle}
          hint={`${resumo.quantidadeVencida} despesas`}
        />
        <StatCard label="Pago no mês" value={carregando ? "—" : formatCurrency(resumo.pagoNoMes)} icon={CircleDollarSign} />
        <StatCard
          label="Vence em 7 dias"
          value={carregando ? "—" : formatCurrency(resumo.vencendo7Dias)}
          icon={CalendarClock}
          hint={`${resumo.quantidadeVencendo7Dias} despesas`}
        />
      </div>

      <ContasAPagarTable despesas={despesas} categorias={categorias} onPagar={pagar} />
    </div>
  );
}
