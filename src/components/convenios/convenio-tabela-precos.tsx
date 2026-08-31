"use client";

import * as React from "react";
import { salvarTabelaConvenioApi } from "@/services/convenios";
import { toast } from "sonner";

import { MoneyInput } from "@/components/shared/money-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { Convenio, Procedimento } from "@/types";

interface ConvenioTabelaPrecosProps {
  convenio: Convenio;
  procedimentos: Procedimento[];
  onSalvo?: () => void;
}

export function ConvenioTabelaPrecos({ convenio, procedimentos, onSalvo }: ConvenioTabelaPrecosProps) {
  const [valores, setValores] = React.useState<Record<string, number>>(() => {
    const inicial: Record<string, number> = {};
    convenio.tabelaPrecos.forEach((item) => {
      inicial[item.procedimentoId] = item.valor;
    });
    return inicial;
  });

  const ativos = procedimentos.filter((procedimento) => procedimento.status === "ativo");

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Tabela de preços</CardTitle>
          <CardDescription>Valores do convênio comparados ao particular.</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            const precos = Object.entries(valores)
              .filter(([, valor]) => valor > 0)
              .map(([procedimentoId, valor]) => ({ procedimentoId, valor }));
            try {
              await salvarTabelaConvenioApi(convenio.id, precos);
              toast.success("Tabela atualizada", { description: convenio.nome });
              onSalvo?.();
            } catch (error) {
              toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar a tabela.");
            }
          }}
        >
          Salvar tabela
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Procedimento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Particular</TableHead>
              <TableHead className="text-right">Valor do convênio</TableHead>
              <TableHead className="text-right">Diferença</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ativos.map((procedimento) => {
              const valorConvenio = valores[procedimento.id];
              const diferenca =
                valorConvenio === undefined ? null : valorConvenio - procedimento.valorParticular;
              return (
                <TableRow key={procedimento.id}>
                  <TableCell className="font-medium">{procedimento.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{procedimento.categoria}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(procedimento.valorParticular)}
                  </TableCell>
                  <TableCell className="text-right">
                    <MoneyInput
                      className="ml-auto max-w-36"
                      value={valorConvenio ?? 0}
                      onChange={(valor) =>
                        setValores((atual) => ({ ...atual, [procedimento.id]: valor }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {diferenca === null
                      ? "—"
                      : `${diferenca > 0 ? "+" : ""}${formatCurrency(diferenca)}`}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
