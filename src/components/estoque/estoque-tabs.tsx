"use client";

import { MovimentacoesTable } from "@/components/estoque/movimentacoes-table";
import { ProdutosTable } from "@/components/estoque/produtos-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MovimentacaoEstoque, Produto } from "@/types";

interface EstoqueTabsProps {
  produtos: Produto[];
  movimentacoes: MovimentacaoEstoque[];
  categorias: string[];
  dataPadrao: string;
}

export function EstoqueTabs({ produtos, movimentacoes, categorias, dataPadrao }: EstoqueTabsProps) {
  return (
    <Tabs defaultValue="produtos">
      <TabsList>
        <TabsTrigger value="produtos">Produtos e insumos ({produtos.length})</TabsTrigger>
        <TabsTrigger value="movimentacoes">Movimentações ({movimentacoes.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="produtos">
        <ProdutosTable produtos={produtos} categorias={categorias} dataPadrao={dataPadrao} />
      </TabsContent>

      <TabsContent value="movimentacoes">
        <MovimentacoesTable movimentacoes={movimentacoes} />
      </TabsContent>
    </Tabs>
  );
}
