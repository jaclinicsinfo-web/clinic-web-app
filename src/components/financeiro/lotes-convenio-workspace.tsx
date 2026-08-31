"use client";

import * as React from "react";
import { FileWarning, Inbox, Landmark, Percent, Plus } from "lucide-react";
import { toast } from "sonner";

import { LotesConvenioTable } from "@/components/financeiro/lotes-convenio-table";
import { formatCompetencia, hojeISO } from "@/components/financeiro/utils";
import { FormField } from "@/components/shared/form-section";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  criarLoteApi,
  enviarLoteApi,
  listarLotesApi,
  reconciliarLoteApi,
  type ResumoLotes,
} from "@/services/financeiro";
import type { LoteConvenio } from "@/types";

const resumoVazio: ResumoLotes = {
  valorApresentado: 0,
  valorGlosado: 0,
  valorRecebido: 0,
  taxaGlosa: 0,
  lotesAbertos: 0,
  lotesAguardando: 0,
};

export function LotesConvenioWorkspace() {
  const [lotes, setLotes] = React.useState<LoteConvenio[]>([]);
  const [resumo, setResumo] = React.useState(resumoVazio);
  const [convenios, setConvenios] = React.useState<{ id: string; nome: string }[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [aberto, setAberto] = React.useState(false);
  const [convenioId, setConvenioId] = React.useState("");
  const [competencia, setCompetencia] = React.useState(hojeISO().slice(0, 7));
  const [salvando, setSalvando] = React.useState(false);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarLotesApi();
      setLotes(data.lotes);
      setResumo(data.resumo);
      setConvenios(data.convenios);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os lotes.");
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  React.useEffect(() => {
    if (!convenioId && convenios[0]) setConvenioId(convenios[0].id);
  }, [convenioId, convenios]);

  async function criarLote() {
    if (!convenioId) return;
    setSalvando(true);
    try {
      await criarLoteApi(convenioId, competencia);
      toast.success("Lote gerado");
      setAberto(false);
      await carregar();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível gerar o lote.");
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
        title="Faturamento de convênios"
        description="Lotes enviados, glosas e valores recebidos das operadoras."
        actions={
          <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Fechar lote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fechar lote de guias</DialogTitle>
                <DialogDescription>Agrupa as cobranças de convênio da competência escolhida.</DialogDescription>
              </DialogHeader>
              <DialogBody className="space-y-4">
                <FormField label="Convênio" required>
                  <Select value={convenioId} onValueChange={setConvenioId}>
                    <SelectTrigger aria-label="Convênio">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {convenios.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Competência" htmlFor="lote-comp" required>
                  <Input id="lote-comp" type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
                </FormField>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAberto(false)}>
                  Cancelar
                </Button>
                <Button loading={salvando} disabled={!convenioId} onClick={() => void criarLote()}>
                  Gerar lote
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Apresentado" value={carregando ? "—" : formatCurrency(resumo.valorApresentado)} icon={Inbox} />
        <StatCard
          label="Glosado"
          value={carregando ? "—" : formatCurrency(resumo.valorGlosado)}
          icon={FileWarning}
          hint={formatPercent(resumo.taxaGlosa)}
        />
        <StatCard label="Recebido" value={carregando ? "—" : formatCurrency(resumo.valorRecebido)} icon={Landmark} />
        <StatCard
          label="Taxa de glosa"
          value={carregando ? "—" : formatPercent(resumo.taxaGlosa)}
          icon={Percent}
          hint={`${resumo.lotesAbertos} abertos · ${resumo.lotesAguardando} enviados`}
        />
      </div>

      <LotesConvenioTable
        lotes={lotes}
        convenios={convenios}
        onEnviar={async (lote) => {
          try {
            await enviarLoteApi(lote.id);
            toast.success("Lote enviado");
            await carregar();
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível enviar o lote.");
          }
        }}
        onConciliar={async (lote, valorGlosado, valorRecebido) => {
          try {
            await reconciliarLoteApi(lote.id, valorGlosado, valorRecebido);
            toast.success("Recebimento conciliado", {
              description: `${lote.convenioNome} · ${formatCompetencia(lote.competencia)}`,
            });
            await carregar();
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível conciliar o lote.");
          }
        }}
      />
    </div>
  );
}
