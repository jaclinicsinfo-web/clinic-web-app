"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { UsuariosTable } from "@/components/configuracoes/usuarios-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { isAdministrador, isAdminOuGestor, planoEstaAcimaDoTeto, rotuloUso } from "@/lib/plano";
import {
  alterarPerfilUsuarioApi,
  ativarUsuarioApi,
  criarUsuarioApi,
  inativarUsuarioApi,
  listarUsuariosApi,
} from "@/services/usuarios";
import type { PerfilAcesso, Unidade, Usuario } from "@/types";

export function UsuariosWorkspace() {
  const sessao = useSessaoStore((state) => state.sessao);
  const atualizarUso = useSessaoStore((state) => state.atualizarUso);
  const admin = isAdministrador(sessao?.perfil);
  const adminOuGestor = isAdminOuGestor(sessao?.perfil);

  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [perfis, setPerfis] = React.useState<PerfilAcesso[]>([]);
  const [unidades, setUnidades] = React.useState<Unidade[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  const uso = sessao?.usoUsuarios ?? null;
  const acimaDoTeto = planoEstaAcimaDoTeto(uso);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await listarUsuariosApi();
      setUsuarios(data.usuarios);
      setPerfis(data.perfis);
      setUnidades(data.unidades);
      if (data.usoUsuarios) atualizarUso(data.usoUsuarios);
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar os usuários. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }, [atualizarUso]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  async function criar(values: { nome: string; email: string; senha: string; perfilId: string; unidadeId: string }) {
    const data = await criarUsuarioApi(values);
    setUsuarios((atual) => [data.usuario, ...atual]);
    atualizarUso(data.usoUsuarios);
  }

  async function inativar(id: string) {
    const data = await inativarUsuarioApi(id);
    setUsuarios((atual) => atual.map((item) => (item.id === id ? data.usuario : item)));
    atualizarUso(data.usoUsuarios);
  }

  async function ativar(id: string) {
    const data = await ativarUsuarioApi(id);
    setUsuarios((atual) => atual.map((item) => (item.id === id ? data.usuario : item)));
    atualizarUso(data.usoUsuarios);
  }

  async function alterarPerfil(id: string, perfilId: string) {
    const data = await alterarPerfilUsuarioApi(id, perfilId);
    setUsuarios((atual) => atual.map((item) => (item.id === id ? data.usuario : item)));
    atualizarUso(data.usoUsuarios);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Contas com acesso ao painel. O limite segue o plano configurado no deploy."
        actions={
          sessao?.plano ? (
            <Badge tone={acimaDoTeto ? "warning" : "primary"}>
              {sessao.plano.nome} · {rotuloUso(uso)}
            </Badge>
          ) : null
        }
      />

      {acimaDoTeto && (
        <p className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {admin
            ? `Há ${uso && uso.limite != null ? uso.usados - uso.limite : 0} conta(s) acima do plano. Inative o excesso para voltar a convidar usuários. Nada é excluído.`
            : "O plano desta clínica está acima do limite. Somente o administrador pode inativar contas extras."}
        </p>
      )}

      {erro ? (
        <EmptyState
          title="Não foi possível listar os usuários"
          description={erro}
          action={
            <Button variant="outline" onClick={() => void carregar()}>
              Tentar de novo
            </Button>
          }
        />
      ) : (
        <UsuariosTable
          usuarios={usuarios}
          perfis={perfis}
          unidades={unidades.length > 0 ? unidades : (sessao?.unidades ?? [])}
          carregando={carregando}
          podeAdicionar={Boolean(uso?.podeAdicionar) && admin && !acimaDoTeto}
          podeGerenciar={admin}
          podeAlterarPerfil={adminOuGestor}
          podeAtribuirAdministrador={admin}
          usuarioAtualId={sessao?.id}
          onCriar={criar}
          onInativar={inativar}
          onAtivar={ativar}
          onAlterarPerfil={alterarPerfil}
        />
      )}
    </div>
  );
}
