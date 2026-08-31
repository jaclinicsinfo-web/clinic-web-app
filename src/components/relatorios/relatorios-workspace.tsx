"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { RelatorioSection } from "@/components/relatorios/relatorio-section";
import { CHART_COLORS, GraficoBarras, GraficoEvolucao, GraficoPizza } from "@/components/relatorios/relatorio-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import {
  obterRelatoriosApi,
  type PeriodoRelatorio,
  type RelatoriosData,
  periodosRelatorio,
} from "@/services/relatorios";

const tipos = [
  { id: "faturamento", label: "Faturamento" },
  { id: "atendimentos", label: "Atendimentos" },
  { id: "inadimplencia", label: "Inadimplência" },
  { id: "pacientes", label: "Novos x recorrentes" },
  { id: "produtividade", label: "Produtividade" },
  { id: "comissoes", label: "Comissões" },
] as const;

interface RelatoriosWorkspaceProps {
  periodo: PeriodoRelatorio;
  tipo: string;
}

export function RelatoriosWorkspace({ periodo, tipo }: RelatoriosWorkspaceProps) {
  const router = useRouter();
  const aba = tipos.some((item) => item.id === tipo) ? tipo : "faturamento";
  const [dados, setDados] = React.useState<RelatoriosData | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    setErro(null);
    setDados(null);
    obterRelatoriosApi(periodo)
      .then((payload) => {
        if (ativo) setDados(payload);
      })
      .catch((error) => {
        if (ativo) {
          setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os relatórios.");
        }
      });
    return () => {
      ativo = false;
    };
  }, [periodo, tentativa]);

  function atualizar(proximoPeriodo: string, proximoTipo: string) {
    router.push(`/relatorios?periodo=${proximoPeriodo}&tipo=${proximoTipo}`);
  }

  const seletorPeriodo = (
    <Select value={periodo} onValueChange={(valor) => atualizar(valor, aba)}>
      <SelectTrigger className="w-48" aria-label="Período do relatório">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {periodosRelatorio.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (erro) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatórios" description="Não foi possível carregar os dados." actions={seletorPeriodo} />
        <EmptyState
          title="Não foi possível carregar"
          description={erro}
          action={
            <Button variant="outline" onClick={() => setTentativa((atual) => atual + 1)}>
              Tentar novamente
            </Button>
          }
        />
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatórios" description="Carregando visão gerencial." actions={seletorPeriodo} />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description={`Visão gerencial de ${dados.intervalo.label}. Filtros de período, tabela, gráfico e exportação CSV.`}
        actions={seletorPeriodo}
      />

      <Tabs value={aba} onValueChange={(valor) => atualizar(periodo, valor)}>
        <TabsList>
          {tipos.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="faturamento">
          <RelatorioSection
            titulo="Faturamento"
            descricao="Receita dos atendimentos realizados no período, por profissional, convênio e procedimento."
            exportFileName="relatorio-faturamento"
            resumo={[
              { label: "Total", valor: formatCurrency(dados.faturamento.total) },
              { label: "Atendimentos", valor: formatNumber(dados.faturamento.quantidade) },
              { label: "Ticket médio", valor: formatCurrency(dados.faturamento.ticketMedio) },
              { label: "Convênios ativos", valor: String(dados.conveniosAtivos) },
            ]}
            chart={<GraficoEvolucao dados={dados.faturamento.evolucao} />}
            colunas={[
              { header: "Profissional", accessor: (linha) => linha.nome },
              {
                header: "Atendimentos",
                accessor: (linha) => String(linha.atendimentos),
                numeric: true,
              },
              {
                header: "Faturamento",
                accessor: (linha) => formatCurrency(linha.valor),
                numeric: true,
              },
            ]}
            dados={dados.faturamento.porProfissional}
            rowKey={(linha) => linha.id}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RelatorioSection
              titulo="Por convênio"
              descricao="Distribuição particular x operadoras."
              exportFileName="relatorio-faturamento-convenio"
              chart={
                <GraficoPizza
                  dados={dados.faturamento.porConvenio.map((item) => ({ nome: item.nome, valor: item.valor }))}
                  moeda
                />
              }
              colunas={[
                { header: "Origem", accessor: (linha) => linha.nome },
                { header: "Atendimentos", accessor: (linha) => String(linha.atendimentos), numeric: true },
                { header: "Valor", accessor: (linha) => formatCurrency(linha.valor), numeric: true },
              ]}
              dados={dados.faturamento.porConvenio}
              rowKey={(linha) => linha.id}
            />
            <RelatorioSection
              titulo="Por procedimento"
              descricao="Receita gerada por serviço oferecido."
              exportFileName="relatorio-faturamento-procedimento"
              colunas={[
                { header: "Procedimento", accessor: (linha) => linha.nome },
                { header: "Qtde.", accessor: (linha) => String(linha.quantidade), numeric: true },
                { header: "Valor", accessor: (linha) => formatCurrency(linha.valor), numeric: true },
              ]}
              dados={dados.faturamento.porProcedimento}
              rowKey={(linha) => linha.id}
            />
          </div>
        </TabsContent>

        <TabsContent value="atendimentos">
          <RelatorioSection
            titulo="Atendimentos"
            descricao="Realizados, cancelados e faltas no período selecionado."
            exportFileName="relatorio-atendimentos"
            resumo={[
              { label: "Total na agenda", valor: formatNumber(dados.atendimentos.total) },
              { label: "Realizados", valor: formatNumber(dados.atendimentos.realizados) },
              { label: "Cancelados", valor: formatNumber(dados.atendimentos.cancelados) },
              { label: "Faltas", valor: formatNumber(dados.atendimentos.faltas) },
            ]}
            chart={
              <GraficoBarras
                dados={dados.atendimentos.evolucao}
                categoria="periodo"
                moeda={false}
                series={[
                  { key: "realizados", nome: "Realizados", cor: CHART_COLORS[0] },
                  { key: "cancelados", nome: "Cancelados", cor: CHART_COLORS[3] },
                  { key: "faltas", nome: "Faltas", cor: CHART_COLORS[4] },
                ]}
              />
            }
            colunas={[
              { header: "Status", accessor: (linha) => linha.nome },
              { header: "Quantidade", accessor: (linha) => String(linha.valor), numeric: true },
            ]}
            dados={dados.atendimentos.porStatus}
            rowKey={(linha) => linha.nome}
          />
        </TabsContent>

        <TabsContent value="inadimplencia">
          <RelatorioSection
            titulo="Inadimplência"
            descricao="Pacientes com cobranças vencidas em aberto."
            exportFileName="relatorio-inadimplencia"
            resumo={[
              { label: "Valor em atraso", valor: formatCurrency(dados.inadimplencia.total) },
              { label: "Cobranças", valor: formatNumber(dados.inadimplencia.quantidade) },
              { label: "Pacientes", valor: formatNumber(dados.inadimplencia.pacientes.length) },
            ]}
            chart={
              <GraficoBarras
                horizontal
                moeda
                dados={dados.inadimplencia.pacientes.slice(0, 8).map((item) => ({
                  nome: item.nome.split(" ")[0] + " " + (item.nome.split(" ").at(-1) ?? ""),
                  valor: item.valor,
                }))}
                categoria="nome"
                series={[{ key: "valor", nome: "Em atraso", cor: CHART_COLORS[3] }]}
              />
            }
            colunas={[
              { header: "Paciente", accessor: (linha) => linha.nome },
              { header: "Cobranças", accessor: (linha) => String(linha.cobrancas), numeric: true },
              { header: "Valor", accessor: (linha) => formatCurrency(linha.valor), numeric: true },
            ]}
            dados={dados.inadimplencia.pacientes}
            rowKey={(linha) => linha.id}
          />
        </TabsContent>

        <TabsContent value="pacientes">
          <RelatorioSection
            titulo="Novos pacientes x recorrentes"
            descricao="Cadastros novos no período versus pacientes que já frequentavam a clínica."
            exportFileName="relatorio-pacientes"
            resumo={[
              { label: "Novos cadastros", valor: formatNumber(dados.pacientes.novos) },
              { label: "Recorrentes atendidos", valor: formatNumber(dados.pacientes.recorrentes) },
            ]}
            chart={
              <GraficoBarras
                dados={dados.pacientes.evolucao}
                categoria="periodo"
                series={[
                  { key: "novos", nome: "Novos", cor: CHART_COLORS[1] },
                  { key: "recorrentes", nome: "Recorrentes", cor: CHART_COLORS[0] },
                ]}
              />
            }
            colunas={[
              { header: "Período", accessor: (linha) => linha.periodo },
              { header: "Novos", accessor: (linha) => String(linha.novos), numeric: true },
              { header: "Recorrentes", accessor: (linha) => String(linha.recorrentes), numeric: true },
            ]}
            dados={dados.pacientes.evolucao}
            rowKey={(linha) => linha.periodo}
          />
        </TabsContent>

        <TabsContent value="produtividade">
          <RelatorioSection
            titulo="Produtividade por profissional"
            descricao="Atendimentos realizados, faltas, ocupação e faturamento gerado."
            exportFileName="relatorio-produtividade"
            chart={
              <GraficoBarras
                horizontal
                dados={dados.produtividade.map((item) => ({
                  nome: item.nome.replace("Dra. ", "").replace("Dr. ", ""),
                  realizados: item.realizados,
                }))}
                categoria="nome"
                series={[{ key: "realizados", nome: "Atendidos", cor: CHART_COLORS[0] }]}
              />
            }
            colunas={[
              { header: "Profissional", accessor: (linha) => linha.nome },
              { header: "Especialidade", accessor: (linha) => linha.especialidade },
              { header: "Realizados", accessor: (linha) => String(linha.realizados), numeric: true },
              { header: "Faltas", accessor: (linha) => String(linha.faltas), numeric: true },
              {
                header: "Ocupação",
                accessor: (linha) => formatPercent(linha.ocupacao),
                numeric: true,
              },
              {
                header: "Faturamento",
                accessor: (linha) => formatCurrency(linha.faturamento),
                numeric: true,
              },
            ]}
            dados={dados.produtividade}
            rowKey={(linha) => linha.id}
          />
        </TabsContent>

        <TabsContent value="comissoes">
          <RelatorioSection
            titulo="Comissões"
            descricao="Extrato de comissões calculadas no período, com status de pagamento."
            exportFileName="relatorio-comissoes"
            resumo={[{ label: "Total do período", valor: formatCurrency(dados.comissoes.total) }]}
            colunas={[
              { header: "Profissional", accessor: (linha) => linha.profissionalNome },
              { header: "Competência", accessor: (linha) => linha.competencia },
              { header: "Atendimentos", accessor: (linha) => String(linha.atendimentos), numeric: true },
              {
                header: "Faturamento",
                accessor: (linha) => formatCurrency(linha.faturamentoGerado),
                numeric: true,
              },
              {
                header: "Comissão",
                accessor: (linha) => formatCurrency(linha.valorComissao),
                numeric: true,
              },
              {
                header: "Status",
                accessor: (linha) => linha.status,
                cell: (linha) => <StatusBadge domain="comissao" status={linha.status} />,
              },
            ]}
            dados={dados.comissoes.lista}
            rowKey={(linha) => linha.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
