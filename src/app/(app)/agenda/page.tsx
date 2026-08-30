import type { Metadata } from "next";
import { format } from "date-fns";

import { AgendaWorkspace } from "@/components/agenda/agenda-workspace";
import { listConvenios, listProcedimentos, salas } from "@/services/catalogo";
import { getBloqueios, getListaEspera, hoje, listAgendamentos } from "@/services/agenda";
import { listPacientes } from "@/services/pacientes";
import { listProfissionais } from "@/services/profissionais";

export const metadata: Metadata = {
  title: "Agenda",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ paciente?: string; profissional?: string; novo?: string; data?: string }>;
}) {
  const params = await searchParams;
  const dataInicial = params.data ?? format(hoje, "yyyy-MM-dd");

  return (
    <AgendaWorkspace
      dataInicial={dataInicial}
      pacienteInicialId={params.paciente}
      profissionalInicialId={params.profissional}
      abrirNovo={params.novo === "1" || Boolean(params.paciente)}
      agendamentosIniciais={listAgendamentos()}
      bloqueiosIniciais={getBloqueios()}
      listaEsperaInicial={getListaEspera()}
      profissionais={listProfissionais()}
      procedimentos={listProcedimentos()}
      pacientes={listPacientes().map((paciente) => ({
        id: paciente.id,
        nome: paciente.nome,
        telefone: paciente.telefone,
        cpf: paciente.cpf,
        dataNascimento: paciente.dataNascimento,
        convenioId: paciente.convenioId,
        alergias: paciente.alergias,
        status: paciente.status,
      }))}
      convenios={listConvenios().map(({ id, nome }) => ({ id, nome }))}
      salas={salas}
    />
  );
}
