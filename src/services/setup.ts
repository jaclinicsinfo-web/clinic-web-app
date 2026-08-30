import { api, ApiError, clearToken } from "@/lib/api";
import { persistirSessao, type ResultadoLogin, type SessaoApi } from "@/services/auth";

export interface StatusSetup {
  precisaSetup: boolean;
}

export interface DadosSetup {
  clinica: {
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    telefone: string;
    email: string;
  };
  unidade: { nome: string; cidade: string };
  usuario: { nome: string; email: string; senha: string };
}

export async function consultarSetup() {
  return api.get<StatusSetup>("/setup/status");
}

export async function concluirSetup(dados: DadosSetup): Promise<ResultadoLogin> {
  clearToken();

  try {
    const data = await api.post<SessaoApi>("/setup", dados);
    return persistirSessao(data, true);
  } catch (error) {
    const mensagem =
      error instanceof ApiError && error.message
        ? error.message
        : "Não foi possível concluir o cadastro. Tente novamente.";
    return { ok: false, erro: mensagem };
  }
}
