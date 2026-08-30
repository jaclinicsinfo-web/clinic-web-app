"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPercent } from "@/lib/format";
import { formasPagamentoAceitas } from "@/services/configuracoes";

export function FormasPagamentoView({
  formas,
}: {
  formas: typeof formasPagamentoAceitas;
}) {
  const [itens, setItens] = React.useState(formas);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formas de pagamento"
        description="Canais aceitos no caixa e no faturamento particular."
        actions={
          <Button onClick={() => toast.success("Formas de pagamento salvas")}>Salvar</Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Canais ativos</CardTitle>
          <CardDescription>Taxas informativas para o cálculo de líquido no financeiro.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Forma</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead className="text-right">Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((forma) => (
                <TableRow key={forma.id}>
                  <TableCell className="font-medium">{forma.nome}</TableCell>
                  <TableCell>
                    {forma.taxa > 0 ? (
                      <span className="tabular-nums">{formatPercent(forma.taxa)}</span>
                    ) : (
                      <Badge tone="outline">Sem taxa</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={forma.ativo}
                      onCheckedChange={(checked) =>
                        setItens((atual) =>
                          atual.map((item) => (item.id === forma.id ? { ...item, ativo: checked } : item)),
                        )
                      }
                      aria-label={`Ativar ${forma.nome}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
