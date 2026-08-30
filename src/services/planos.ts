import { api } from "@/lib/api";
import type { PlanoAtual } from "@/types";

export async function listarPlanosApi() {
  return api.get<{ planos: PlanoAtual[] }>("/planos");
}
