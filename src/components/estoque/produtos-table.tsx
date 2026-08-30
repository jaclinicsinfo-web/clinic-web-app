"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ArrowDownUp } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { MovimentacaoModal } from "@/components/estoque/movimentacao-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Produto } from "@/types";

interface ProdutosTableProps {
  produtos: Produto[];
  categorias: string[];
  dataPadrao: string;
}

export function ProdutosTable({ produtos, categorias, dataPadrao }: ProdutosTableProps) {
  const [categoria, setCategoria] = React.useState("todas");
  const [apenasAbaixo, setApenasAbaixo] = React.useState(false);
  const [movimentando, setMovimentando] = React.useState<Produto | null>(null);

  const dados = React.useMemo(() => {
    return produtos.filter((produto) => {
      if (categoria !== "todas" && produto.categoria !== categoria) return false;
      if (apenasAbaixo && produto.quantidadeAtual >= produto.estoqueMinimo) return false;
      return true;
    });
  }, [produtos, categoria, apenasAbaixo]);

  const columns = React.useMemo<ColumnDef<Produto, unknown>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Produto",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.original.nome}</p>
            <p className="text-xs text-muted-foreground">{row.original.fornecedor}</p>
          </div>
        ),
      },
      {
        accessorKey: "categoria",
        header: "Categoria",
        cell: ({ row }) => <Badge tone="outline">{row.original.categoria}</Badge>,
      },
      {
        accessorKey: "unidadeMedida",
        header: "Unidade",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.unidadeMedida}</span>,
      },
      {
        accessorKey: "quantidadeAtual",
        header: "Quantidade atual",
        cell: ({ row }) => {
          const produto = row.original;
          const abaixo = produto.quantidadeAtual < produto.estoqueMinimo;

          return (
            <span className="flex items-center gap-2">
              <span className={abaixo ? "font-semibold tabular-nums text-danger" : "font-medium tabular-nums"}>
                {formatNumber(produto.quantidadeAtual)}
              </span>
              {abaixo && (
                <Badge tone="danger">
                  <AlertTriangle className="size-3" />
                  Estoque baixo
                </Badge>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "estoqueMinimo",
        header: "Estoque mínimo",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{formatNumber(row.original.estoqueMinimo)}</span>
        ),
      },
      {
        accessorKey: "custoUnitario",
        header: "Custo unitário",
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.custoUnitario)}</span>,
      },
      {
        id: "valorTotal",
        accessorFn: (row) => row.quantidadeAtual * row.custoUnitario,
        header: "Valor total",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.quantidadeAtual * row.original.custoUnitario)}
          </span>
        ),
      },
      {
        id: "acoes",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false,
        size: 72,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Movimentar ${row.original.nome}`}
              onClick={() => setMovimentando(row.original)}
            >
              <ArrowDownUp />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dados}
        searchPlaceholder="Buscar por produto, categoria ou fornecedor..."
        exportFileName="estoque-produtos"
        pageSize={10}
        emptyTitle="Nenhum produto encontrado"
        emptyDescription="Ajuste os filtros para ver outros insumos do estoque."
        toolbar={
          <>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-52" aria-label="Filtrar por categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda categoria</SelectItem>
                {categorias.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={apenasAbaixo ? "default" : "outline"}
              size="sm"
              onClick={() => setApenasAbaixo((valor) => !valor)}
              aria-pressed={apenasAbaixo}
            >
              <AlertTriangle />
              Abaixo do mínimo
            </Button>
          </>
        }
      />

      <MovimentacaoModal
        open={Boolean(movimentando)}
        onOpenChange={(aberto) => !aberto && setMovimentando(null)}
        produtos={produtos}
        dataPadrao={dataPadrao}
        produtoSelecionadoId={movimentando?.id}
      />
    </>
  );
}
