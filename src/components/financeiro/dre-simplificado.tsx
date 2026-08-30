import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatPercent } from "@/lib/format";

interface LinhaDre {
  categoria: string;
  valor: number;
}

interface DreSimplificadoProps {
  receitas: LinhaDre[];
  despesas: LinhaDre[];
  className?: string;
}

const CHART_COLORS = ["#0d5c6b", "#2a9d8f", "#e9c46a", "#f4a261", "#6b7fd7"];

function ListaDre({
  titulo,
  linhas,
  total,
  totalTone,
}: {
  titulo: string;
  linhas: LinhaDre[];
  total: number;
  totalTone: "success" | "danger";
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
        <span
          className={
            totalTone === "success"
              ? "text-sm font-semibold tabular-nums text-success"
              : "text-sm font-semibold tabular-nums text-danger"
          }
        >
          {formatCurrency(total)}
        </span>
      </div>

      {linhas.length === 0 ? (
        <EmptyState
          title="Sem lançamentos no mês"
          description="Nenhum valor foi registrado nesta seção na competência atual."
          className="py-8"
        />
      ) : (
        <ul className="mt-3 space-y-3">
          {linhas.map((linha, index) => {
            const participacao = total > 0 ? (linha.valor / total) * 100 : 0;
            return (
              <li key={linha.categoria}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-foreground">{linha.categoria}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCurrency(linha.valor)}
                    <span className="ml-2 text-xs">{formatPercent(participacao)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${participacao}%`,
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DreSimplificado({ receitas, despesas, className }: DreSimplificadoProps) {
  const totalReceitas = receitas.reduce((total, linha) => total + linha.valor, 0);
  const totalDespesas = despesas.reduce((total, linha) => total + linha.valor, 0);
  const resultado = totalReceitas - totalDespesas;
  const margem = totalReceitas > 0 ? (resultado / totalReceitas) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>DRE simplificado</CardTitle>
        <CardDescription>Receitas e despesas por categoria na competência atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ListaDre titulo="Receitas" linhas={receitas} total={totalReceitas} totalTone="success" />
          <ListaDre titulo="Despesas" linhas={despesas} total={totalDespesas} totalTone="danger" />
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Resultado do mês</p>
            <p className="text-xs text-muted-foreground">
              Margem de {formatPercent(margem)} sobre a receita reconhecida
            </p>
          </div>
          <span
            className={
              resultado >= 0
                ? "text-xl font-semibold tabular-nums text-success"
                : "text-xl font-semibold tabular-nums text-danger"
            }
          >
            {formatCurrency(resultado)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
