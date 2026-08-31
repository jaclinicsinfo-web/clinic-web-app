"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ArrowDownUp, MoreHorizontal, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { MovimentacaoModal } from "@/components/estoque/movimentacao-modal";
import { ProdutoDialog } from "@/components/estoque/produto-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatNumber } from "@/lib/format";
import { ApiError } from "@/lib/api";
import { alternarProdutoApi } from "@/services/estoque";
import type { MovimentacaoEstoque, Produto } from "@/types";

interface ProdutosTableProps {
  produtos: Produto[];
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

export function ProdutosTable({
  produtos,
  categorias,
  unidadesMedida,
  procedimentos,
  dataPadrao,
  podeCriar,
  podeEditar,
  onProdutoSalvo,
  onProdutoAtualizado,
  onMovimentacao,
}: ProdutosTableProps) {
  const [categoria, setCategoria] = React.useState("todas");
  const [apenasAbaixo, setApenasAbaixo] = React.useState(false);
  const [movimentando, setMovimentando] = React.useState<Produto | null>(null);
  const [editando, setEditando] = React.useState<Produto | null>(null);
  const [novoAberto, setNovoAberto] = React.useState(false);
  const [alternando, setAlternando] = React.useState<Produto | null>(null);

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
              {abaixo && produto.ativo !== false && (
                <Badge tone="danger">
                  <AlertTriangle className="size-3" />
                  Estoque baixo
                </Badge>
              )}
              {produto.ativo === false && <Badge tone="outline">Inativo</Badge>}
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
        size: 88,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            {podeCriar && row.original.ativo !== false && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Movimentar ${row.original.nome}`}
                onClick={() => setMovimentando(row.original)}
              >
                <ArrowDownUp />
              </Button>
            )}
            {podeEditar && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${row.original.nome}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditando(row.original)}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    destructive={row.original.ativo !== false}
                    onSelect={() => setAlternando(row.original)}
                  >
                    <Power />
                    {row.original.ativo === false ? "Reativar" : "Inativar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ),
      },
    ],
    [podeCriar, podeEditar],
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
        emptyDescription="Cadastre insumos para controlar saldo, mínimo e movimentações."
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

            {podeCriar && (
              <Button onClick={() => setNovoAberto(true)}>
                <Plus />
                Novo produto
              </Button>
            )}
          </>
        }
      />

      <MovimentacaoModal
        open={Boolean(movimentando)}
        onOpenChange={(aberto) => !aberto && setMovimentando(null)}
        produtos={produtos.filter((item) => item.ativo !== false)}
        procedimentos={procedimentos}
        dataPadrao={dataPadrao}
        produtoSelecionadoId={movimentando?.id}
        onRegistrada={(resultado) => {
          onMovimentacao(resultado.produto, resultado.movimentacao);
          setMovimentando(null);
        }}
      />

      <ProdutoDialog
        open={novoAberto || Boolean(editando)}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setNovoAberto(false);
            setEditando(null);
          }
        }}
        categorias={categorias}
        unidadesMedida={unidadesMedida}
        produto={editando}
        onSalvo={(produto) => {
          if (editando) onProdutoAtualizado(produto);
          else onProdutoSalvo(produto);
        }}
      />

      <ConfirmDialog
        open={Boolean(alternando)}
        onOpenChange={(aberto) => !aberto && setAlternando(null)}
        title={alternando?.ativo === false ? "Reativar produto?" : "Inativar produto?"}
        description={
          alternando?.ativo === false
            ? `${alternando.nome} voltará a aparecer nas movimentações.`
            : `${alternando?.nome ?? ""} deixará de aparecer nas novas movimentações.`
        }
        confirmLabel={alternando?.ativo === false ? "Reativar" : "Inativar"}
        destructive={alternando?.ativo !== false}
        onConfirm={async () => {
          if (!alternando) return;
          try {
            const atualizado = await alternarProdutoApi(alternando.id);
            onProdutoAtualizado(atualizado);
            toast.success(atualizado.ativo === false ? "Produto inativado" : "Produto reativado", {
              description: atualizado.nome,
            });
            setAlternando(null);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível atualizar o produto.");
          }
        }}
      />
    </>
  );
}
