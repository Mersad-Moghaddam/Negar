import { AxiosError, AxiosResponse } from 'axios'

type ApiEnvelope<T> = { data: T }

export type ApiErrorPayload = {
  code?: string
  message?: string
  details?: Record<string, string> | null
}

export function extractData<T>(response: AxiosResponse<T | ApiEnvelope<T>>): T {
  const payload = response.data as T | ApiEnvelope<T>
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data
  }
  return payload as T
}

export function parseApiError(error: unknown): ApiErrorPayload {
  const fallback: ApiErrorPayload = { code: 'unknown_error', message: 'Something went wrong.' }
  const axiosError = error as AxiosError | undefined
  const data = axiosError?.response?.data as ApiErrorPayload | undefined
  const status = axiosError?.response?.status
  if (!data && !status) return fallback
  if (!data) {
    return { code: 'network_error', message: 'Unable to reach server. Please check your connection.' }
  }
  return {
    code: data.code ?? 'unknown_error',
    message: data.message ?? fallback.message,
    details: data.details ?? null
  }
}
