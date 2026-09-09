"use client";

import * as React from "react";
import { AlertCircle, CalendarClock, CircleDollarSign, Wallet } from "lucide-react";
import { toast } from "sonner";

import { ContasAReceberTable } from "@/components/financeiro/contas-a-receber-table";
import { NovaCobrancaDialog } from "@/components/financeiro/nova-cobranca-dialog";
import { Pode } from "@/components/auth/pode";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { formaPagamentoLabels } from "@/lib/status";
import {
  listarCobrancasApi,
  pagarCobrancaApi,
  type ResumoContasAReceber,
} from "@/services/financeiro";
import type { Cobranca } from "@/types";

const resumoVazio: ResumoContasAReceber = {
  totalEmAberto: 0,
  totalAtrasado: 0,
  recebidoNoMes: 0,
  vencendo7Dias: 0,
  quantidadeAtrasada: 0,
  quantidadeEmAberto: 0,
  quantidadeVencendo7Dias: 0,
};

export function ContasAReceberWorkspace() {
  const [cobrancas, setCobrancas] = React.useState<Cobranca[]>([]);
  const [resumo, setResumo] = React.useState(resumoVazio);
  const [convenios, setConvenios] = React.useState<{ id: string; nome: string }[]>([]);
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarCobrancasApi();
      setCobrancas(data.cobrancas);
      setResumo(data.resumo);
      setConvenios(data.convenios);
      setPacientes(data.pacientes);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as cobranças.");
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function pagar(cobranca: Cobranca, pagamento: { valor: number; formaPagamento: Cobranca["formaPagamento"]; data: string; observacoes: string }) {
    try {
      await pagarCobrancaApi(cobranca.id, {
        valor: pagamento.valor,
        formaPagamento: pagamento.formaPagamento ?? "pix",
        data: pagamento.data,
        observacoes: pagamento.observacoes,
      });
      toast.success("Pagamento registrado", {
        description: `${cobranca.pacienteNome} · ${formatCurrency(pagamento.valor)} em ${formaPagamentoLabels[pagamento.formaPagamento ?? "pix"]}`,
      });
      await carregar();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível registrar o pagamento.");
    }
  }

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas a receber"
        description="Cobranças de pacientes e faturamento particular da clínica."
        actions={
          <Pode modulo="financeiro" acao="criar">
            <NovaCobrancaDialog pacientes={pacientes} convenios={convenios} onCriada={() => void carregar()} />
          </Pode>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Em aberto" value={carregando ? "—" : formatCurrency(resumo.totalEmAberto)} icon={Wallet} />
        <StatCard
          label="Em atraso"
          value={carregando ? "—" : formatCurrency(resumo.totalAtrasado)}
          icon={AlertCircle}
          hint={`${resumo.quantidadeAtrasada} cobranças`}
        />
        <StatCard
          label="Recebido no mês"
          value={carregando ? "—" : formatCurrency(resumo.recebidoNoMes)}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Vence em 7 dias"
          value={carregando ? "—" : formatCurrency(resumo.vencendo7Dias)}
          icon={CalendarClock}
          hint={`${resumo.quantidadeVencendo7Dias} cobranças`}
        />
      </div>

      <ContasAReceberTable cobrancas={cobrancas} convenios={convenios} onPagar={pagar} />
    </div>
  );
}
