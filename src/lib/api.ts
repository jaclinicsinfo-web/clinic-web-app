/**
 * Cliente HTTP do ERP.
 *
 * A camada de `src/services` é a única que deve chamar estas funções — as telas
 * consomem os services, nunca o cliente diretamente.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_STORAGE_KEY = "clinicerp.token";

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
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

async function request<TResponse>(endpoint: string, options: RequestOptions = {}): Promise<TResponse> {
  const { params, body, headers, ...rest } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`, API_BASE_URL || "http://localhost");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const token = getToken();

  const response = await fetch(API_BASE_URL ? url.toString() : `${endpoint}${url.search}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

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
