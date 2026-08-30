/**
 * Cliente HTTP do ERP.
 *
 * A camada de `src/services` é a única que deve chamar estas funções — as telas
 * consomem os services, nunca o cliente diretamente.
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const TOKEN_LOCAL = "clinicerp.token";
const TOKEN_TEMP = "clinicerp.token.temp";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_LOCAL) ?? window.sessionStorage.getItem(TOKEN_TEMP);
}

export function setToken(token: string, lembrar = true) {
  if (lembrar) {
    window.localStorage.setItem(TOKEN_LOCAL, token);
    window.sessionStorage.removeItem(TOKEN_TEMP);
    return;
  }

  window.sessionStorage.setItem(TOKEN_TEMP, token);
  window.localStorage.removeItem(TOKEN_LOCAL);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_LOCAL);
  window.sessionStorage.removeItem(TOKEN_TEMP);
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

async function request<TResponse>(endpoint: string, options: RequestOptions = {}): Promise<TResponse> {
  const { params, body, headers, ...rest } = options;

  if (!API_BASE_URL) {
    throw new ApiError("URL da API não configurada.", 0);
  }

  const url = new URL(`${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const token = getToken();

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Tente novamente.", 0);
  }

  if (response.status === 204) return undefined as TResponse;

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message =
      (payload as { message?: string | string[] })?.message ?? response.statusText ?? "Falha na requisição";
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status, payload);
  }

  return payload as TResponse;
}

export const api = {
  get: <TResponse>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<TResponse>(endpoint, { ...options, method: "GET" }),

  post: <TResponse>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<TResponse>(endpoint, { ...options, method: "POST", body }),

  put: <TResponse>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<TResponse>(endpoint, { ...options, method: "PUT", body }),

  patch: <TResponse>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<TResponse>(endpoint, { ...options, method: "PATCH", body }),

  delete: <TResponse>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<TResponse>(endpoint, { ...options, method: "DELETE" }),
};
