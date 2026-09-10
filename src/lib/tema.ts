export const TEMA_STORAGE_KEY = "clinicerp.tema";

export type TemaSistema = "claro" | "escuro";

export function temaValido(valor: unknown): valor is TemaSistema {
  return valor === "claro" || valor === "escuro";
}

export function aplicarClasseTema(tema: TemaSistema) {
  if (typeof document === "undefined") return;
  const raiz = document.documentElement;
  raiz.classList.toggle("dark", tema === "escuro");
  raiz.style.colorScheme = tema === "escuro" ? "dark" : "light";
}

export function aplicarTema(tema: TemaSistema) {
  aplicarClasseTema(tema);
  window.localStorage.setItem(TEMA_STORAGE_KEY, tema);
}

export function lerTema(): TemaSistema {
  if (typeof window === "undefined") return "claro";
  const salvo = window.localStorage.getItem(TEMA_STORAGE_KEY);
  return temaValido(salvo) ? salvo : "claro";
}
