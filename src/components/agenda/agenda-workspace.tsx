"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarPlus, ChevronLeft, ChevronRight, Lock, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatISODate, parseLocalDate } from "@/lib/format";
import { getStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import { duracaoEmMinutos, somarMinutos } from "@/services/agenda";
import type { Agendamento, AgendamentoStatus, BloqueioAgenda, ListaEsperaItem, Procedimento, Profissional } from "@/types";

import { AppointmentSheet, type AgendamentoDraft, type PacienteAgenda } from "./appointment-sheet";
import { BloqueioDialog } from "./bloqueio-dialog";
import { CalendarView, deslocarPeriodo, type SlotSelecionado, type VisaoAgenda } from "./calendar-view";
import { ListaEsperaDialog } from "./lista-espera-dialog";
import { classesBlocoStatus } from "./agenda-utils";

interface AgendaWorkspaceProps {
  dataInicial: string;
  pacienteInicialId?: string;
  profissionalInicialId?: string;
  abrirNovo?: boolean;
  agendamentosIniciais: Agendamento[];
  bloqueiosIniciais: BloqueioAgenda[];
  listaEsperaInicial: ListaEsperaItem[];
  profissionais: Profissional[];
  procedimentos: Procedimento[];
  pacientes: PacienteAgenda[];
  convenios: { id: string; nome: string }[];
  salas: string[];
}

const visoes: { id: VisaoAgenda; label: string }[] = [
  { id: "dia", label: "Dia" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
];

const statusFiltro: AgendamentoStatus[] = [
  "agendado",
  "confirmado",
  "check_in",
  "em_atendimento",
  "atendido",
  "cancelado",
  "faltou",
];

export function AgendaWorkspace({
  dataInicial,
  pacienteInicialId,
  profissionalInicialId,
  abrirNovo = false,
  agendamentosIniciais,
  bloqueiosIniciais,
  listaEsperaInicial,
  profissionais,
  procedimentos,
  pacientes: pacientesIniciais,
  convenios,
  salas,
}: AgendaWorkspaceProps) {
  const router = useRouter();

  const [dataIso, setDataIso] = React.useState(dataInicial);
  const [visao, setVisao] = React.useState<VisaoAgenda>("dia");
  const [profissionalFiltro, setProfissionalFiltro] = React.useState(profissionalInicialId ?? "todos");
  const [salaFiltro, setSalaFiltro] = React.useState("todas");
  const [statusFiltroAtual, setStatusFiltroAtual] = React.useState("todos");

  const [agendamentos, setAgendamentos] = React.useState(agendamentosIniciais);
  const [bloqueios, setBloqueios] = React.useState(bloqueiosIniciais);
  const [listaEspera, setListaEspera] = React.useState(listaEsperaInicial);
  const [pacientes, setPacientes] = React.useState(pacientesIniciais);

  const [agendamentoAberto, setAgendamentoAberto] = React.useState<Agendamento | null>(null);
  const [slotAberto, setSlotAberto] = React.useState<SlotSelecionado | null>(null);
  const [pacienteSheetId, setPacienteSheetId] = React.useState<string | undefined>(pacienteInicialId);
  const [sheetAberto, setSheetAberto] = React.useState(abrirNovo || Boolean(pacienteInicialId));
  const [bloqueioAberto, setBloqueioAberto] = React.useState(false);
  const [esperaAberta, setEsperaAberta] = React.useState(false);

  const profissionaisAtivos = React.useMemo(
    () => profissionais.filter((profissional) => profissional.status === "ativo"),
    [profissionais],
  );

  const profissionaisVisiveis = React.useMemo(
    () =>
      profissionalFiltro === "todos"
        ? profissionaisAtivos
        : profissionaisAtivos.filter((profissional) => profissional.id === profissionalFiltro),
    [profissionalFiltro, profissionaisAtivos],
  );

  const agendamentosFiltrados = React.useMemo(() => {
    return agendamentos.filter((agendamento) => {
      if (profissionalFiltro !== "todos" && agendamento.profissionalId !== profissionalFiltro) return false;
      if (salaFiltro !== "todas" && agendamento.sala !== salaFiltro) return false;
      if (statusFiltroAtual !== "todos" && agendamento.status !== statusFiltroAtual) return false;
      return true;
    });
  }, [agendamentos, profissionalFiltro, salaFiltro, statusFiltroAtual]);

  const agendamentosDaVisao = React.useMemo(() => {
    if (visao === "dia") return agendamentosFiltrados.filter((item) => item.data === dataIso);
    const referencia = parseLocalDate(dataIso);
    if (visao === "semana") {
      const inicio = startOfWeek(referencia, { weekStartsOn: 1 });
      const fim = addDays(inicio, 6);
      return agendamentosFiltrados.filter((item) => {
        const data = parseLocalDate(item.data);
        return data >= inicio && data <= fim;
      });
    }
    const prefixo = dataIso.slice(0, 7);
    return agendamentosFiltrados.filter((item) => item.data.startsWith(prefixo));
  }, [agendamentosFiltrados, dataIso, visao]);

  const resumo = React.useMemo(() => {
    const doDia = agendamentos.filter((item) => item.data === dataIso);
    return {
      total: doDia.length,
      confirmados: doDia.filter((item) => item.status === "confirmado" || item.status === "check_in").length,
      emAtendimento: doDia.filter((item) => item.status === "em_atendimento").length,
      faturamento: doDia
        .filter((item) => item.status !== "cancelado" && item.status !== "faltou")
        .reduce((total, item) => total + item.valor, 0),
    };
  }, [agendamentos, dataIso]);

  const tituloPeriodo = React.useMemo(() => {
    const data = parseLocalDate(dataIso);
    if (visao === "dia") return format(data, "EEEE, dd 'de' MMMM", { locale: ptBR });
    if (visao === "semana") {
      const inicio = startOfWeek(data, { weekStartsOn: 1 });
      const fim = addDays(inicio, 6);
      return `${format(inicio, "dd MMM", { locale: ptBR })} – ${format(fim, "dd MMM yyyy", { locale: ptBR })}`;
    }
    return format(data, "MMMM yyyy", { locale: ptBR });
  }, [dataIso, visao]);

  function abrirCriacao(slot?: SlotSelecionado, pacienteId?: string) {
    setAgendamentoAberto(null);
    setSlotAberto(slot ?? { data: dataIso, horaInicio: "09:00" });
    setPacienteSheetId(pacienteId);
    setSheetAberto(true);
  }

  function salvarAgendamento(draft: AgendamentoDraft) {
    const agora = new Date().toISOString();
    if (draft.id) {
      setAgendamentos((atual) =>
        atual.map((item) => (item.id === draft.id ? { ...item, ...draft, id: draft.id } : item)),
      );
      toast.success("Agendamento atualizado", { description: `${draft.pacienteNome} · ${draft.horaInicio}` });
    } else {
      const novo: Agendamento = {
        ...draft,
        id: `ag-local-${Date.now()}`,
        lembreteEnviado: false,
        criadoPor: "Aline Ferreira",
        criadoEm: agora,
      };
      setAgendamentos((atual) => [...atual, novo]);
      toast.success("Horário agendado", { description: `${draft.pacienteNome} · ${draft.horaInicio}` });
    }
    setSheetAberto(false);
    setAgendamentoAberto(null);
    setSlotAberto(null);
  }

  function mudarStatus(id: string, status: AgendamentoStatus) {
    setAgendamentos((atual) => atual.map((item) => (item.id === id ? { ...item, status } : item)));
    setAgendamentoAberto((atual) => (atual && atual.id === id ? { ...atual, status } : atual));
    toast.success(`Status: ${getStatusMeta("agendamento", status).label}`);
  }

  function reagendar(id: string, slot: SlotSelecionado) {
    setAgendamentos((atual) =>
      atual.map((item) => {
        if (item.id !== id) return item;
        const duracao = duracaoEmMinutos(item.horaInicio, item.horaFim) || 30;
        const profissional = profissionais.find((prof) => prof.id === (slot.profissionalId ?? item.profissionalId));
        return {
          ...item,
          data: slot.data,
          horaInicio: slot.horaInicio,
          horaFim: somarMinutos(slot.horaInicio, duracao),
          profissionalId: slot.profissionalId ?? item.profissionalId,
          profissionalNome: profissional?.nome ?? item.profissionalNome,
        };
      }),
    );
    toast.success("Agendamento reagendado");
  }

  function irParaHoje() {
    setDataIso(formatISODate(new Date()));
  }

  React.useEffect(() => {
    if (!abrirNovo && !pacienteInicialId) return;
    router.replace("/agenda");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- limpa o query só na montagem
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Grade por profissional, confirmações, check-in e encaixes da clínica."
        actions={
          <>
            <Button variant="outline" onClick={() => setEsperaAberta(true)}>
              <Users />
              Lista de espera
              {listaEspera.length > 0 && (
                <span className="rounded-full bg-primary-subtle px-1.5 text-xs font-semibold text-primary">
                  {listaEspera.length}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={() => setBloqueioAberto(true)}>
              <Lock />
              Bloquear horário
            </Button>
            <Button onClick={() => abrirCriacao()}>
              <CalendarPlus />
              Novo agendamento
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Atendimentos do dia" value={String(resumo.total)} />
        <StatCard label="Confirmados / check-in" value={String(resumo.confirmados)} />
        <StatCard label="Em atendimento" value={String(resumo.emAtendimento)} />
        <StatCard label="Previsto no dia" value={formatCurrency(resumo.faturamento)} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={() => setDataIso(deslocarPeriodo(dataIso, visao, -1))} aria-label="Período anterior">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="sm" onClick={irParaHoje}>
              Hoje
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setDataIso(deslocarPeriodo(dataIso, visao, 1))} aria-label="Próximo período">
              <ChevronRight />
            </Button>
            <p className="ml-1 text-sm font-semibold capitalize text-foreground">{tituloPeriodo}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5">
              {visoes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVisao(item.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium",
                    visao === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Select value={profissionalFiltro} onValueChange={setProfissionalFiltro}>
              <SelectTrigger className="w-48" aria-label="Filtrar por profissional">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os profissionais</SelectItem>
                {profissionaisAtivos.map((profissional) => (
                  <SelectItem key={profissional.id} value={profissional.id}>
                    {profissional.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={salaFiltro} onValueChange={setSalaFiltro}>
              <SelectTrigger className="w-40" aria-label="Filtrar por sala">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as salas</SelectItem>
                {salas.map((sala) => (
                  <SelectItem key={sala} value={sala}>
                    {sala}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFiltroAtual} onValueChange={setStatusFiltroAtual}>
              <SelectTrigger className="w-40" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo status</SelectItem>
                {statusFiltro.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusMeta("agendamento", status).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {statusFiltro.map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm border", classesBlocoStatus[status])} />
            {getStatusMeta("agendamento", status).label}
          </span>
        ))}
      </div>

      <CalendarView
        visao={visao}
        dataIso={dataIso}
        agendamentos={agendamentosDaVisao}
        bloqueios={bloqueios}
        profissionais={profissionaisVisiveis}
        onSelectAgendamento={(agendamento) => {
          setAgendamentoAberto(agendamento);
          setSlotAberto(null);
          setPacienteSheetId(undefined);
          setSheetAberto(true);
        }}
        onSelectSlot={(slot) => abrirCriacao(slot)}
        onReagendar={reagendar}
        onSelectDia={(iso) => {
          setDataIso(iso);
          setVisao("dia");
        }}
      />

      <AppointmentSheet
        open={sheetAberto}
        onOpenChange={(aberto) => {
          setSheetAberto(aberto);
          if (!aberto) {
            setAgendamentoAberto(null);
            setSlotAberto(null);
          }
        }}
        agendamento={agendamentoAberto}
        slot={slotAberto}
        pacienteInicialId={pacienteSheetId}
        pacientes={pacientes}
        profissionais={profissionaisAtivos}
        procedimentos={procedimentos}
        convenios={convenios}
        salas={salas}
        onSave={salvarAgendamento}
        onChangeStatus={mudarStatus}
        onNovoPaciente={(paciente) => setPacientes((atual) => [paciente, ...atual])}
      />

      <BloqueioDialog
        open={bloqueioAberto}
        onOpenChange={setBloqueioAberto}
        profissionais={profissionaisAtivos}
        dataPadrao={dataIso}
        profissionalPadrao={profissionalFiltro === "todos" ? undefined : profissionalFiltro}
        onSave={(bloqueio) => {
          setBloqueios((atual) => [...atual, { ...bloqueio, id: `blq-local-${Date.now()}` }]);
          setBloqueioAberto(false);
          toast.success("Horário bloqueado", { description: bloqueio.motivo });
        }}
      />

      <ListaEsperaDialog
        open={esperaAberta}
        onOpenChange={setEsperaAberta}
        itens={listaEspera}
        profissionais={profissionaisAtivos}
        onEncaixar={(item) => {
          setListaEspera((atual) => atual.filter((espera) => espera.id !== item.id));
          setEsperaAberta(false);
          abrirCriacao(
            {
              data: dataIso,
              horaInicio: item.preferenciaPeriodo === "tarde" ? "14:00" : "09:00",
              profissionalId: item.profissionalId,
            },
            item.pacienteId,
          );
        }}
      />
    </div>
  );
}
