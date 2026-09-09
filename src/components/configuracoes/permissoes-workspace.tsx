"use client";

import * as React from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { isAdministrador } from "@/lib/plano";
import { planoIncluiModulo } from "@/lib/modulos-plano";
import { normalizarPermissoes } from "@/lib/permissoes";
import { listarPerfisApi, salvarPermissoesApi } from "@/services/perfis";
import { obterSessaoAtual } from "@/services/auth";
import { modulosLabels } from "@/services/configuracoes";
import { useSessaoStore } from "@/hooks/use-sessao";
import type { PerfilAcesso, Permissao } from "@/types";

const acoes = [
  { chave: "visualizar" as const, label: "Visualizar" },
  { chave: "criar" as const, label: "Criar" },
  { chave: "editar" as const, label: "Editar" },
  { chave: "excluir" as const, label: "Desativar" },
];

const somenteVisualizar = new Set(["dashboard", "relatorios", "integracoes", "powerbi", "agenteia"]);

export function PermissoesWorkspace() {
  const plano = useSessaoStore((state) => state.sessao?.plano);
  const perfilIdSessao = useSessaoStore((state) => state.sessao?.perfilId);
  const aplicarContextoPlano = useSessaoStore((state) => state.aplicarContextoPlano);
  const [perfis, setPerfis] = React.useState<PerfilAcesso[]>([]);
  const [perfilId, setPerfilId] = React.useState("");
  const [matriz, setMatriz] = React.useState<Record<string, Permissao[]>>({});
  const [carregando, setCarregando] = React.useState(true);
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const lista = await listarPerfisApi();
      setPerfis(lista);
      setMatriz(Object.fromEntries(lista.map((perfil) => [perfil.id, normalizarPermissoes(perfil.permissoes)])));
      setPerfilId((atual) => atual || lista[0]?.id || "");
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar os perfis.");
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  const perfil = perfis.find((item) => item.id === perfilId);
  const permissoes = (matriz[perfilId] ?? []).filter((item) => planoIncluiModulo(plano, item.modulo));
  const bloqueado = isAdministrador(perfil?.nome);

  function alterar(modulo: Permissao["modulo"], campo: keyof Omit<Permissao, "modulo">, valor: boolean) {
    if (bloqueado) return;
    setMatriz((atual) => ({
      ...atual,
      [perfilId]: (atual[perfilId] ?? []).map((item) =>
        item.modulo === modulo ? { ...item, [campo]: valor } : item,
      ),
    }));
  }

  async function salvar() {
    if (!perfil || bloqueado) return;
    setSalvando(true);
    try {
      const atualizado = await salvarPermissoesApi(perfil.id, matriz[perfil.id] ?? []);
      setPerfis((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
      setMatriz((atual) => ({ ...atual, [atualizado.id]: normalizarPermissoes(atualizado.permissoes) }));
      if (atualizado.id === perfilIdSessao) {
        const contexto = await obterSessaoAtual();
        if (contexto) {
          aplicarContextoPlano({
            ...contexto,
            perfilId: contexto.perfilId,
            permissoes: contexto.permissoes,
          });
        }
      }
      toast.success("Permissões salvas", { description: atualizado.nome });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar as permissões.");
    } finally {
      setSalvando(false);
    }
  }

  if (erro) {
    return (
      <EmptyState
        title="Não foi possível carregar os perfis"
        description={erro}
        action={
          <Button variant="outline" onClick={() => void carregar()}>
            Tentar de novo
          </Button>
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Matriz de permissões</CardTitle>
          <CardDescription>
            {carregando
              ? "Carregando perfis da clínica…"
              : (perfil?.descricao ?? "Selecione um perfil para editar o acesso por módulo.")}
            {perfil?.sistema ? " Perfil de sistema — alterações valem para todos os usuários deste perfil." : ""}
            {bloqueado ? " O administrador sempre tem acesso total." : ""}
            {" Desativar controla inativar, arquivar e remover."}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={perfilId} onValueChange={setPerfilId} disabled={carregando || perfis.length === 0}>
            <SelectTrigger className="w-56" aria-label="Perfil">
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              {perfis.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => void salvar()} disabled={carregando || salvando || !perfil || bloqueado}>
            {salvando ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Módulo</TableHead>
              {acoes.map((acao) => (
                <TableHead key={acao.chave} className="text-center">
                  {acao.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissoes.map((permissao) => (
              <TableRow key={permissao.modulo}>
                <TableCell className="font-medium">{modulosLabels[permissao.modulo]}</TableCell>
                {acoes.map((acao) => (
                  <TableCell key={acao.chave} className="text-center">
                    <Checkbox
                      checked={permissao[acao.chave]}
                      disabled={bloqueado || carregando || (acao.chave !== "visualizar" && somenteVisualizar.has(permissao.modulo))}
                      onCheckedChange={(checked) => alterar(permissao.modulo, acao.chave, checked === true)}
                      aria-label={`${acao.label} em ${modulosLabels[permissao.modulo]}`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
