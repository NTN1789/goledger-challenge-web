import { readString, isPlainObject } from '../utils/guards'

export function parseMaybeJson(text: string) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export function extractErrorMessage(parsed: unknown, text: string, status: number) {
  if (isPlainObject(parsed)) {
    const parsedObject = parsed as Record<string, unknown>
    const message =
      readString(parsedObject.message) ??
      readString(parsedObject.error) ??
      readString(parsedObject.details)
    if (message) return `Erro ${status}: ${message}`
  }

  return `Erro ${status}: ${text || 'resposta invalida da API'}`
}

export async function callGoLedgerApi<T>(
  apiBaseUrl: string,
  username: string,
  password: string,
  path: string,
  payload: Record<string, unknown> = {},
) {
  const authValue = window.btoa(`${username.trim()}:${password}`)

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Basic ${authValue}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await response.text()
  const parsed = parseMaybeJson(text)

  if (!response.ok) {
    throw new Error(extractErrorMessage(parsed, text, response.status))
  }

  return parsed as T
}
