"use client";

import * as React from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Pode } from "@/components/auth/pode";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { formatPercent } from "@/lib/format";
import { temPermissao } from "@/lib/permissoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import { listarFormasPagamentoApi, salvarFormasPagamentoApi, type FormaPagamentoCadastro } from "@/services/financeiro";

export function FormasPagamentoView() {
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const podeEditar = temPermissao(permissoes, "configuracoes", "editar");
  const [itens, setItens] = React.useState<FormaPagamentoCadastro[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await listarFormasPagamentoApi();
        if (ativo) setItens(data.formas);
      } catch (error) {
        if (ativo) {
          setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as formas de pagamento.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  async function salvar() {
    if (!podeEditar) return;
    setSalvando(true);
    try {
      const formas = await salvarFormasPagamentoApi(
        itens.map((item) => ({ codigo: item.codigo, nome: item.nome, taxa: item.taxa, ativo: item.ativo })),
      );
      setItens(formas);
      toast.success("Formas de pagamento salvas");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formas de pagamento"
        description="Canais aceitos no caixa e no faturamento particular."
        actions={
          <Pode modulo="configuracoes" acao="editar">
            <Button onClick={() => void salvar()} loading={salvando} disabled={carregando}>
              Salvar
            </Button>
          </Pode>
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
                      disabled={!podeEditar}
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
