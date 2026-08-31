"use client";

import { MovimentacoesTable } from "@/components/estoque/movimentacoes-table";
import { ProdutosTable } from "@/components/estoque/produtos-table";
import { ConsumoTable } from "@/components/estoque/consumo-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConsumoEstoque, MovimentacaoEstoque, Produto } from "@/types";

interface EstoqueTabsProps {
  produtos: Produto[];
  movimentacoes: MovimentacaoEstoque[];
  consumo: ConsumoEstoque[];
  categorias: string[];
  unidadesMedida: string[];
  procedimentos: { id: string; nome: string }[];
  dataPadrao: string;
  podeCriar: boolean;
  podeEditar: boolean;
  onProdutoSalvo: (produto: Produto) => void;
  onProdutoAtualizado: (produto: Produto) => void;
  onMovimentacao: (produto: Produto, movimentacao: MovimentacaoEstoque) => void;
}

export function EstoqueTabs({
  produtos,
  movimentacoes,
  consumo,
  categorias,
  unidadesMedida,
  procedimentos,
  dataPadrao,
  podeCriar,
  podeEditar,
  onProdutoSalvo,
  onProdutoAtualizado,
  onMovimentacao,
}: EstoqueTabsProps) {
  return (
    <Tabs defaultValue="produtos">
      <TabsList>
        <TabsTrigger value="produtos">Produtos e insumos ({produtos.length})</TabsTrigger>
        <TabsTrigger value="movimentacoes">Movimentações ({movimentacoes.length})</TabsTrigger>
        <TabsTrigger value="consumo">Consumo ({consumo.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="produtos">
        <ProdutosTable
          produtos={produtos}
          categorias={categorias}
          unidadesMedida={unidadesMedida}
          procedimentos={procedimentos}
          dataPadrao={dataPadrao}
          podeCriar={podeCriar}
          podeEditar={podeEditar}
          onProdutoSalvo={onProdutoSalvo}
          onProdutoAtualizado={onProdutoAtualizado}
          onMovimentacao={onMovimentacao}
        />
      </TabsContent>

      <TabsContent value="movimentacoes">
        <MovimentacoesTable movimentacoes={movimentacoes} />
      </TabsContent>

      <TabsContent value="consumo">
        <ConsumoTable consumo={consumo} />
      </TabsContent>
    </Tabs>
  );
}
