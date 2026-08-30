import type { Metadata } from "next";
import { format } from "date-fns";
import { AlertTriangle, Boxes, PackageMinus, Wallet } from "lucide-react";

import { EstoqueAlerta } from "@/components/estoque/estoque-alerta";
import { EstoqueTabs } from "@/components/estoque/estoque-tabs";
import { RegistrarMovimentacaoButton } from "@/components/estoque/registrar-movimentacao-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { hoje } from "@/services/agenda";
import {
  categoriasProduto,
  getProdutosAbaixoDoMinimo,
  getResumoEstoque,
  listMovimentacoes,
  listProdutos,
} from "@/services/estoque";

export const metadata: Metadata = {
  title: "Estoque",
};

export default function EstoquePage() {
  const produtos = listProdutos();
  const movimentacoes = listMovimentacoes();
  const resumo = getResumoEstoque();
  const abaixoDoMinimo = getProdutosAbaixoDoMinimo();
  const dataPadrao = format(hoje, "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Insumos, saldos e movimentações de entrada e saída da clínica."
        actions={<RegistrarMovimentacaoButton produtos={produtos} dataPadrao={dataPadrao} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Itens cadastrados"
          value={String(resumo.totalItens)}
          icon={Boxes}
          hint={`${categoriasProduto.length} categorias de insumos`}
        />
        <StatCard
          label="Valor em estoque"
          value={formatCurrency(resumo.valorEmEstoque)}
          icon={Wallet}
          hint="Saldo atual avaliado pelo custo unitário"
        />
        <StatCard
          label="Abaixo do mínimo"
          value={String(resumo.abaixoDoMinimo)}
          icon={AlertTriangle}
          hint="Itens que precisam de reposição"
        />
        <StatCard
          label="Saídas registradas"
          value={String(resumo.saidasNoPeriodo)}
          icon={PackageMinus}
          hint="Consumo lançado no histórico de movimentações"
        />
      </div>

      <EstoqueAlerta produtos={abaixoDoMinimo} />

      <EstoqueTabs
        produtos={produtos}
        movimentacoes={movimentacoes}
        categorias={categoriasProduto}
        dataPadrao={dataPadrao}
      />
    </div>
  );
}
