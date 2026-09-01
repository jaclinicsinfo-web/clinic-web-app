"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarPlus, ChevronLeft, ChevronRight, Loader2, Lock, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { formatCurrency, formatISODate, parseLocalDate } from "@/lib/format";
import { getStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  alterarStatusAgendamentoApi,
  atualizarAgendamentoApi,
  criarAgendamentoApi,
  criarBloqueioApi,
  duracaoEmMinutos,
  encaixarEsperaApi,
  obterAgendaApi,
  reagendarAgendamentoApi,
  somarMinutos,
} from "@/services/agenda";
import type { Agendamento, AgendamentoStatus, BloqueioAgenda, ListaEsperaItem, Procedimento, Profissional } from "@/types";

import { AppointmentSheet, type AgendamentoDraft, type PacienteAgenda } from "./appointment-sheet";
import { BloqueioDialog } from "./bloqueio-dialog";
import { CalendarView, deslocarPeriodo, type SlotSelecionado, type VisaoAgenda } from "./calendar-view";
import { ListaEsperaDialog } from "./lista-espera-dialog";
import { classesBlocoStatus } from "./agenda-utils";

function mapearPacienteAgenda(paciente: {
  id: string;
  nome: string;
  telefone: string;
  cpf?: string;
  dataNascimento?: string;
  convenioId: string | null;
  alergias?: string[];
  status?: string;
}): PacienteAgenda {
  return {
    id: paciente.id,
    nome: paciente.nome,
    telefone: paciente.telefone,
    cpf: paciente.cpf,
    dataNascimento: paciente.dataNascimento,
    convenioId: paciente.convenioId,
    alergias: paciente.alergias,
    status: paciente.status,
  };
}

interface AgendaWorkspaceProps {
  dataInicial?: string;
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

export function AgendaWorkspace({ dataInicial }: AgendaWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteInicialId = searchParams.get("paciente") ?? undefined;
  const profissionalInicialId = searchParams.get("profissional") ?? undefined;
  const abrirNovo = searchParams.get("novo") === "1" || Boolean(pacienteInicialId);
  const dataQuery = searchParams.get("data") ?? dataInicial ?? formatISODate(new Date());

  const [dataIso, setDataIso] = React.useState(dataQuery);
  const [visao, setVisao] = React.useState<VisaoAgenda>("dia");
  const [profissionalFiltro, setProfissionalFiltro] = React.useState(profissionalInicialId ?? "todos");
  const [salaFiltro, setSalaFiltro] = React.useState("todas");
  const [statusFiltroAtual, setStatusFiltroAtual] = React.useState("todos");

  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([]);
  const [bloqueios, setBloqueios] = React.useState<BloqueioAgenda[]>([]);
  const [listaEspera, setListaEspera] = React.useState<ListaEsperaItem[]>([]);
  const [pacientes, setPacientes] = React.useState<PacienteAgenda[]>([]);
  const [ultimosPacientes, setUltimosPacientes] = React.useState<PacienteAgenda[]>([]);
  const [ultimosPorProfissional, setUltimosPorProfissional] = React.useState<Record<string, PacienteAgenda[]>>({});
  const [conveniosAgenda, setConveniosAgenda] = React.useState<{ id: string; nome: string }[]>([]);
  const [profissionais, setProfissionais] = React.useState<Profissional[]>([]);
  const [procedimentos, setProcedimentos] = React.useState<Procedimento[]>([]);
  const [salas, setSalas] = React.useState<string[]>([]);
  const [somenteProprios, setSomenteProprios] = React.useState(false);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const pedidoAgenda = React.useRef(0);

  const carregar = React.useCallback(async (referencia: string, visaoAtual: VisaoAgenda) => {
    const requisicao = ++pedidoAgenda.current;
    const data = parseLocalDate(referencia);
    let de = referencia;
    let ate = referencia;
    if (visaoAtual === "semana") {
      const inicio = startOfWeek(data, { weekStartsOn: 1 });
      de = formatISODate(inicio);
      ate = formatISODate(addDays(inicio, 6));
    } else if (visaoAtual === "mes") {
      de = `${referencia.slice(0, 7)}-01`;
      ate = formatISODate(new Date(data.getFullYear(), data.getMonth() + 1, 0));
    }

    try {
      const payload = await obterAgendaApi(de, ate);
      if (requisicao !== pedidoAgenda.current) return;
      setAgendamentos(payload.agendamentos);
      setBloqueios(payload.bloqueios);
      setListaEspera(payload.listaEspera);
      setPacientes(payload.pacientes.map(mapearPacienteAgenda));
      setUltimosPacientes((payload.ultimosPacientes ?? []).map(mapearPacienteAgenda));
      setUltimosPorProfissional(
        Object.fromEntries(
          Object.entries(payload.ultimosPacientesPorProfissional ?? {}).map(([id, lista]) => [
            id,
            lista.map(mapearPacienteAgenda),
          ]),
        ),
      );
      setConveniosAgenda(payload.convenios);
      setProfissionais(payload.profissionais);
      setProcedimentos(payload.procedimentos);
      setSalas(payload.salas);
      setSomenteProprios(payload.somenteProprios);
      if (payload.somenteProprios) {
        setProfissionalFiltro(payload.meuProfissionalId ?? "");
      }
      setErro(null);
    } catch (error) {
      if (requisicao !== pedidoAgenda.current) return;
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar a agenda.");
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar(dataIso, visao);
  }, [carregar, dataIso, visao]);

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
    setSlotAberto(
      slot ?? {
        data: dataIso,
        horaInicio: "09:00",
        profissionalId: profissionalFiltro !== "todos" ? profissionalFiltro : undefined,
      },
    );
    setPacienteSheetId(pacienteId);
    setSheetAberto(true);
  }

  async function salvarAgendamento(draft: AgendamentoDraft) {
    const payload = {
      pacienteId: draft.pacienteId,
      profissionalId: draft.profissionalId,
      procedimentoId: draft.procedimentoId,
      data: draft.data,
      horaInicio: draft.horaInicio,
      horaFim: draft.horaFim,
      sala: draft.sala ?? null,
      particular: draft.particular,
      convenioId: draft.convenioId,
      observacoes: draft.observacoes ?? null,
      status: draft.status,
    };

    try {
      const salvo = draft.id
        ? await atualizarAgendamentoApi(draft.id, payload)
        : await criarAgendamentoApi(payload);
      setAgendamentos((atual) =>
        draft.id ? atual.map((item) => (item.id === salvo.id ? salvo : item)) : [...atual, salvo],
      );
      toast.success(draft.id ? "Agendamento atualizado" : "Horário agendado", {
        description: `${salvo.pacienteNome} · ${salvo.horaInicio}`,
      });
      const pacienteSalvo = pacientes.find((item) => item.id === draft.pacienteId);
      if (pacienteSalvo) {
        setUltimosPacientes((atual) =>
          [pacienteSalvo, ...atual.filter((item) => item.id !== pacienteSalvo.id)].slice(0, 3),
        );
        setUltimosPorProfissional((atual) => ({
          ...atual,
          [draft.profissionalId]: [
            pacienteSalvo,
            ...(atual[draft.profissionalId] ?? []).filter((item) => item.id !== pacienteSalvo.id),
          ].slice(0, 3),
        }));
      }
      setSheetAberto(false);
      setAgendamentoAberto(null);
      setSlotAberto(null);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar o agendamento.");
    }
  }

  async function mudarStatus(id: string, status: AgendamentoStatus) {
    try {
      const atualizado = await alterarStatusAgendamentoApi(id, status);
      setAgendamentos((atual) => atual.map((item) => (item.id === id ? atualizado : item)));
      setAgendamentoAberto((atual) => (atual && atual.id === id ? atualizado : atual));
      toast.success(`Status: ${getStatusMeta("agendamento", status).label}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível alterar o status.");
    }
  }

  async function reagendar(id: string, slot: SlotSelecionado) {
    const atual = agendamentos.find((item) => item.id === id);
    if (!atual) return;
    const duracao = duracaoEmMinutos(atual.horaInicio, atual.horaFim) || 30;
    try {
      const atualizado = await reagendarAgendamentoApi(id, {
        data: slot.data,
        horaInicio: slot.horaInicio,
        horaFim: somarMinutos(slot.horaInicio, duracao),
        profissionalId: slot.profissionalId,
      });
      setAgendamentos((lista) => lista.map((item) => (item.id === id ? atualizado : item)));
      toast.success("Agendamento reagendado");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível reagendar.");
    }
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
      {carregando ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-primary" aria-label="Carregando agenda" />
        </div>
      ) : erro ? (
        <EmptyState title="Não foi possível carregar a agenda" description={erro} />
      ) : somenteProprios && profissionaisAtivos.length === 0 ? (
        <EmptyState
          title="Cadastro clínico não vinculado"
          description="Peça a um administrador para criar o profissional na clínica e vincular esta conta de login. Sem isso a agenda e os pacientes ficam vazios."
        />
      ) : (
        <>
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

            <Select
              value={profissionalFiltro || profissionaisAtivos[0]?.id}
              onValueChange={setProfissionalFiltro}
              disabled={somenteProprios}
            >
              <SelectTrigger className="w-48" aria-label="Filtrar por profissional">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {!somenteProprios && <SelectItem value="todos">Todos os profissionais</SelectItem>}
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
        ultimosPacientes={ultimosPacientes}
        ultimosPacientesPorProfissional={ultimosPorProfissional}
        profissionais={profissionaisAtivos}
        procedimentos={procedimentos}
        convenios={conveniosAgenda}
        salas={salas}
        onSave={salvarAgendamento}
        onChangeStatus={mudarStatus}
        onNovoPaciente={() => router.push("/pacientes/novo")}
      />

      <BloqueioDialog
        open={bloqueioAberto}
        onOpenChange={setBloqueioAberto}
        profissionais={profissionaisAtivos}
        dataPadrao={dataIso}
        profissionalPadrao={profissionalFiltro === "todos" ? undefined : profissionalFiltro}
        onSave={async (bloqueio) => {
          try {
            const criado = await criarBloqueioApi(bloqueio);
            setBloqueios((atual) => [...atual, criado]);
            setBloqueioAberto(false);
            toast.success("Horário bloqueado", { description: bloqueio.motivo });
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível bloquear o horário.");
          }
        }}
      />

      <ListaEsperaDialog
        open={esperaAberta}
        onOpenChange={setEsperaAberta}
        itens={listaEspera}
        pacientes={pacientes}
        profissionais={profissionaisAtivos}
        procedimentos={procedimentos}
        onCriado={(item) => setListaEspera((atual) => [item, ...atual])}
        onEncaixar={async (item) => {
          try {
            await encaixarEsperaApi(item.id);
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
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível encaixar o paciente.");
          }
        }}
      />
        </>
      )}
    </div>
  );
}
