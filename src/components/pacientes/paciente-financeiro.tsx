"use client";

import * as React from "react";
import { AlertCircle, CircleDollarSign, Plus, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";

import { FinanceiroPacienteTable } from "@/components/pacientes/financeiro-paciente";
import { usePacientePerfil } from "@/components/pacientes/paciente-perfil-shell";
import { FormField } from "@/components/shared/form-section";
import { MoneyInput } from "@/components/shared/money-input";
import { StatCard } from "@/components/shared/stat-card";
import { Pode } from "@/components/auth/pode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { hojeISO } from "@/components/financeiro/utils";
import { criarCobrancaApi } from "@/services/financeiro";

export function PacienteFinanceiro() {
  const { paciente, detalhe, recarregar } = usePacientePerfil();
  const cobrancas = detalhe.cobrancas;
  const pagas = cobrancas.filter((cobranca) => cobranca.status === "pago");
  const atrasadas = cobrancas.filter((cobranca) => cobranca.status === "atrasado");
  const [aberto, setAberto] = React.useState(false);
  const [descricao, setDescricao] = React.useState("");
  const [valor, setValor] = React.useState(0);
  const [vencimento, setVencimento] = React.useState(hojeISO());
  const [agendamentoId, setAgendamentoId] = React.useState("avulsa");
  const [salvando, setSalvando] = React.useState(false);

  const agendamentosElegiveis = detalhe.agendamentos.filter(
    (item) => item.status === "atendido" && !cobrancas.some((cobranca) => cobranca.agendamentoId === item.id),
  );

  async function gerar() {
    setSalvando(true);
    try {
      const doAgendamento = agendamentoId !== "avulsa";
      const agendamento = detalhe.agendamentos.find((item) => item.id === agendamentoId);
      await criarCobrancaApi({
        pacienteId: paciente.id,
        agendamentoId: doAgendamento ? agendamentoId : null,
        descricao: doAgendamento ? (agendamento?.procedimentoNome ?? descricao) : descricao,
        valor: doAgendamento ? (agendamento?.valor ?? valor) : valor,
        vencimento,
        convenioId: paciente.convenioId ?? null,
      });
      toast.success("Cobrança gerada");
      setAberto(false);
      setDescricao("");
      setValor(0);
      setAgendamentoId("avulsa");
      await recarregar();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível gerar a cobrança.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Pode modulo="financeiro" acao="criar">
          <Button onClick={() => setAberto(true)}>
            <Plus />
            Gerar cobrança
          </Button>
        </Pode>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo devedor" value={formatCurrency(paciente.saldoDevedor)} icon={Wallet} />
        <StatCard
          label="Recebido"
          value={formatCurrency(pagas.reduce((total, cobranca) => total + cobranca.valor, 0))}
          icon={CircleDollarSign}
          hint={`${pagas.length} cobranças quitadas`}
        />
        <StatCard
          label="Cobranças em aberto"
          value={String(cobrancas.filter((item) => item.status !== "pago" && item.status !== "cancelado").length)}
          icon={Receipt}
        />
        <StatCard
          label="Em atraso"
          value={formatCurrency(atrasadas.reduce((total, cobranca) => total + cobranca.valor, 0))}
          icon={AlertCircle}
          hint={`${atrasadas.length} ${atrasadas.length === 1 ? "lançamento" : "lançamentos"}`}
        />
      </div>

      <FinanceiroPacienteTable cobrancas={cobrancas} onAtualizado={() => void recarregar()} />

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar cobrança</DialogTitle>
            <DialogDescription>Lançamento avulso ou vinculado a um atendimento já realizado.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <FormField label="Origem">
              <Select value={agendamentoId} onValueChange={setAgendamentoId}>
                <SelectTrigger aria-label="Origem da cobrança">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avulsa">Cobrança avulsa</SelectItem>
                  {agendamentosElegiveis.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.procedimentoNome} · {formatCurrency(item.valor)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {agendamentoId === "avulsa" ? (
              <>
                <FormField label="Descrição" htmlFor="pac-cob-desc" required>
                  <Input id="pac-cob-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                </FormField>
                <FormField label="Valor" required>
                  <MoneyInput value={valor} onChange={setValor} />
                </FormField>
              </>
            ) : null}
            <FormField label="Vencimento" htmlFor="pac-cob-venc" required>
              <Input id="pac-cob-venc" type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button
              loading={salvando}
              disabled={agendamentoId === "avulsa" && (descricao.trim().length < 3 || valor <= 0)}
              onClick={() => void gerar()}
            >
              Gerar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
