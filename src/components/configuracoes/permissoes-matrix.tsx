"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modulosLabels } from "@/services/configuracoes";
import type { PerfilAcesso, Permissao } from "@/types";

const acoes = [
  { chave: "visualizar" as const, label: "Visualizar" },
  { chave: "criar" as const, label: "Criar" },
  { chave: "editar" as const, label: "Editar" },
  { chave: "excluir" as const, label: "Excluir" },
];

export function PermissoesMatrix({ perfis }: { perfis: PerfilAcesso[] }) {
  const [perfilId, setPerfilId] = React.useState(perfis[0]?.id ?? "");
  const [matriz, setMatriz] = React.useState<Record<string, Permissao[]>>(() =>
    Object.fromEntries(perfis.map((perfil) => [perfil.id, perfil.permissoes])),
  );

  const perfil = perfis.find((item) => item.id === perfilId);
  const permissoes = matriz[perfilId] ?? [];

  function alterar(modulo: Permissao["modulo"], campo: keyof Omit<Permissao, "modulo">, valor: boolean) {
    setMatriz((atual) => ({
      ...atual,
      [perfilId]: (atual[perfilId] ?? []).map((item) =>
        item.modulo === modulo ? { ...item, [campo]: valor } : item,
      ),
    }));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Matriz de permissões</CardTitle>
          <CardDescription>
            {perfil?.descricao ?? "Selecione um perfil para editar o acesso por módulo."}
            {perfil?.sistema ? " Perfil de sistema — alterações valem para todos os usuários deste perfil." : ""}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={perfilId} onValueChange={setPerfilId}>
            <SelectTrigger className="w-56" aria-label="Perfil">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perfis.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => toast.success("Permissões salvas", { description: perfil?.nome })}
          >
            Salvar
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
