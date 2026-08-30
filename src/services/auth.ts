import type { Unidade, Usuario } from "@/types";

import { SENHA_DEMONSTRACAO } from "./mock/auth";
import { clinica, usuarios } from "./mock/pessoas";

export type ResultadoLogin =
  | { ok: true; usuario: Usuario; unidades: Unidade[] }
  | { ok: false; erro: string };

function delay(ms = 550) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unidadesDoUsuario(usuario: Usuario): Unidade[] {
  return clinica.unidades.filter((unidade) => usuario.unidadesAcesso.includes(unidade.id));
}

export async function autenticar(email: string, senha: string): Promise<ResultadoLogin> {
  await delay();

  const usuario = usuarios.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());

  if (!usuario || senha !== SENHA_DEMONSTRACAO) {
    return { ok: false, erro: "E-mail ou senha incorretos." };
  }

  if (usuario.status !== "ativo") {
    return { ok: false, erro: "Este usuário está inativo. Fale com o administrador da clínica." };
  }

  return { ok: true, usuario, unidades: unidadesDoUsuario(usuario) };
}

export function listUnidadesDaSessao(unidadesAcesso: string[]): Unidade[] {
  return clinica.unidades.filter((unidade) => unidadesAcesso.includes(unidade.id));
}
