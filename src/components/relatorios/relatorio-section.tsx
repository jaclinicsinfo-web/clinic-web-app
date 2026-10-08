"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ColunaRelatorio<T> {
  header: string;
  /** Valor textual usado na exportação CSV e como conteúdo padrão da célula. */
  accessor: (linha: T) => string;
  cell?: (linha: T) => React.ReactNode;
  numeric?: boolean;
}

interface RelatorioSectionProps<T> {
  titulo: string;
  descricao: string;
  colunas: ColunaRelatorio<T>[];
  dados: T[];
  rowKey: (linha: T) => string;
  exportFileName: string;
  chart?: React.ReactNode;
  resumo?: { label: string; valor: string }[];
  rodape?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

function exportarCsv<T>(nomeArquivo: string, colunas: ColunaRelatorio<T>[], dados: T[]) {
  const linhas = [
    colunas.map((coluna) => coluna.header),
    ...dados.map((linha) => colunas.map((coluna) => coluna.accessor(linha).replace(/"/g, '""'))),
  ];

  const csv = linhas.map((linha) => linha.map((celula) => `"${celula}"`).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nomeArquivo}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function RelatorioSection<T>({
  titulo,
  descricao,
  colunas,
  dados,
  rowKey,
  exportFileName,
  chart,
  resumo,
  rodape,
  emptyTitle = "Sem dados no período",
  emptyDescription = "Selecione outro período ou verifique se há lançamentos registrados.",
  className,
}: RelatorioSectionProps<T>) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportarCsv(exportFileName, colunas, dados)}
          disabled={dados.length === 0}
        >
          <Download />
          Exportar
        </Button>
      </CardHeader>

      {resumo && resumo.length > 0 && (
        <CardContent className="pt-0">
          <dl className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {resumo.map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{item.valor}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}

      {chart && <CardContent className="pt-0">{chart}</CardContent>}

      <CardContent className="px-0 pb-0 pt-0">
        {dados.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} className="border-t border-border" />
        ) : (
          <div className="border-t border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {colunas.map((coluna) => (
                    <TableHead key={coluna.header} className={cn(coluna.numeric && "text-right")}>
                      {coluna.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((linha) => (
                  <TableRow key={rowKey(linha)}>
                    {colunas.map((coluna) => (
                      <TableCell
                        key={coluna.header}
                        className={cn(coluna.numeric && "text-right tabular-nums")}
                      >
                        {coluna.cell ? coluna.cell(linha) : coluna.accessor(linha)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rodape}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
