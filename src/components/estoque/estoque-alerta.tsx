import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Produto } from "@/types";

export function EstoqueAlerta({ produtos }: { produtos: Produto[] }) {
  if (produtos.length === 0) return null;

  const valorReposicao = produtos.reduce(
    (total, produto) => total + (produto.estoqueMinimo - produto.quantidadeAtual) * produto.custoUnitario,
    0,
  );

  return (
    <Card className="border-danger/20 bg-danger-bg/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-danger">
          <AlertTriangle className="size-4" />
          {produtos.length} {produtos.length === 1 ? "item abaixo do estoque mínimo" : "itens abaixo do estoque mínimo"}
        </CardTitle>
        <CardDescription>
          Reposição estimada de {formatCurrency(valorReposicao)} para voltar aos níveis mínimos definidos.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y divide-border border-t border-border">
          {produtos.map((produto) => (
            <li key={produto.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{produto.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {produto.categoria} · {produto.fornecedor}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Mínimo {formatNumber(produto.estoqueMinimo)} {produto.unidadeMedida}
                </span>
                <Badge tone="danger">
                  {formatNumber(produto.quantidadeAtual)} {produto.unidadeMedida} em estoque
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
